package com.watchstore.service;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.entity.OrderItem;
import com.watchstore.domain.entity.Product;
import com.watchstore.domain.entity.User;
import com.watchstore.domain.enums.OrderStatus;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.infrastructure.stripe.PaymentGateway;
import com.watchstore.repository.OrderRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.repository.UserRepository;
import com.watchstore.web.dto.CheckoutConfirmRequest;
import com.watchstore.web.dto.CheckoutConfirmResponse;
import com.watchstore.web.dto.CheckoutInitiateResponse;
import io.micrometer.core.instrument.Counter;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private static final String CHECKOUT_LOCK_PREFIX = "checkout:lock:";
    private static final Duration CHECKOUT_TTL = Duration.ofMinutes(15);

    private final CartService cartService;
    private final InventoryService inventoryService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentGateway paymentGateway;
    private final StringRedisTemplate stringRedisTemplate;
    private final Counter checkoutFailuresTotal;
    private final Counter ordersCreatedTotal;

    @Transactional
    public CheckoutInitiateResponse initiate(UUID userId, String sessionId) {
        Map<UUID, Integer> cartItems = cartService.getCartItems(userId, sessionId);
        if (cartItems.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        UUID checkoutId = UUID.randomUUID();
        String lockKey = CHECKOUT_LOCK_PREFIX + (userId != null ? userId : sessionId);

        Boolean acquired = stringRedisTemplate.opsForValue()
                .setIfAbsent(lockKey, checkoutId.toString(), CHECKOUT_TTL);
        if (Boolean.FALSE.equals(acquired)) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.CONFLICT, "Checkout already in progress");
        }

        try {
            inventoryService.reserveStock(checkoutId, cartItems);
        } catch (RuntimeException e) {
            stringRedisTemplate.delete(lockKey);
            checkoutFailuresTotal.increment();
            throw e;
        }

        List<CheckoutInitiateResponse.CheckoutLineItem> lineItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<UUID, Integer> entry : cartItems.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(entry.getValue()));
            total = total.add(lineTotal);
            lineItems.add(new CheckoutInitiateResponse.CheckoutLineItem(
                    product.getId(), product.getName(), entry.getValue(), product.getPrice()));
        }

        stringRedisTemplate.opsForValue().set("checkout:" + checkoutId, userId != null ? userId.toString() : sessionId, CHECKOUT_TTL);

        return new CheckoutInitiateResponse(
                checkoutId,
                total,
                lineItems,
                Instant.now().plus(CHECKOUT_TTL).getEpochSecond()
        );
    }

    @Transactional
    public CheckoutConfirmResponse confirm(UUID userId, CheckoutConfirmRequest request) {
        String ownerKey = stringRedisTemplate.opsForValue().get("checkout:" + request.checkoutId());
        if (ownerKey == null) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.GONE, "Checkout session expired");
        }

        if (userId == null) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required to confirm checkout");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<UUID, Integer> reservedItems = inventoryService.loadReservationForCheckout(request.checkoutId());
        if (reservedItems.isEmpty()) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.GONE, "Reservation expired");
        }

        try {
            inventoryService.confirmReservation(request.checkoutId());

            Order order = new Order();
            order.setUser(user);
            order.setStatus(OrderStatus.PENDING_PAYMENT);
            order.setShippingAddress(request.shippingAddress());

            BigDecimal total = BigDecimal.ZERO;
            for (Map.Entry<UUID, Integer> entry : reservedItems.entrySet()) {
                Product product = productRepository.findById(entry.getKey())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(product);
                item.setQuantity(entry.getValue());
                item.setUnitPrice(product.getPrice());
                order.getOrderItems().add(item);
                total = total.add(product.getPrice().multiply(BigDecimal.valueOf(entry.getValue())));
            }
            order.setTotalAmount(total);
            orderRepository.save(order);

            String paymentIntentId = paymentGateway.createPaymentIntent(order.getId(), total, "USD");
            order.setPaymentIntentId(paymentIntentId);
            orderRepository.save(order);

            cartService.clearCart(userId, null);
            stringRedisTemplate.delete(CHECKOUT_LOCK_PREFIX + userId);
            stringRedisTemplate.delete("checkout:" + request.checkoutId());

            ordersCreatedTotal.increment();

            return new CheckoutConfirmResponse(order.getId(), order.getStatus(), order.getTotalAmount(), paymentIntentId);
        } catch (RuntimeException e) {
            checkoutFailuresTotal.increment();
            inventoryService.releaseReservation(request.checkoutId());
            throw e;
        }
    }
}
