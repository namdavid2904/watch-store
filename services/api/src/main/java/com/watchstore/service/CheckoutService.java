package com.watchstore.service;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.entity.OrderItem;
import com.watchstore.domain.entity.Product;
import com.watchstore.domain.entity.User;
import com.watchstore.domain.enums.OrderStatus;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.infrastructure.stripe.PaymentGateway;
import com.watchstore.infrastructure.stripe.PaymentIntentResult;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
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

        stringRedisTemplate.opsForValue().set(
                checkoutSessionKey(checkoutId),
                userId != null ? userId.toString() : sessionId,
                CHECKOUT_TTL);

        return new CheckoutInitiateResponse(
                checkoutId,
                total,
                lineItems,
                Instant.now().plus(CHECKOUT_TTL).getEpochSecond()
        );
    }

    @Transactional
    public CheckoutConfirmResponse confirm(UUID userId, String sessionId, CheckoutConfirmRequest request) {
        String ownerKey = stringRedisTemplate.opsForValue().get(checkoutSessionKey(request.checkoutId()));
        if (ownerKey == null) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.GONE, "Checkout session expired");
        }

        if (userId == null) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required to confirm checkout");
        }

        if (!matchesOwner(ownerKey, userId, sessionId)) {
            checkoutFailuresTotal.increment();
            throw new ApiException(HttpStatus.FORBIDDEN, "Checkout session does not belong to caller");
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

            PaymentIntentResult paymentIntent = paymentGateway.createPaymentIntent(order.getId(), total, "USD");
            order.setPaymentIntentId(paymentIntent.paymentIntentId());
            orderRepository.save(order);

            cartService.clearCart(userId, null);
            clearCheckoutSession(userId, sessionId, request.checkoutId());

            ordersCreatedTotal.increment();
            log.info("order created orderId={} userId={} total={} itemCount={}",
                    order.getId(), userId, total, order.getOrderItems().size());

            return new CheckoutConfirmResponse(
                    order.getId(),
                    order.getStatus(),
                    order.getTotalAmount(),
                    paymentIntent.paymentIntentId(),
                    paymentIntent.clientSecret());
        } catch (RuntimeException e) {
            checkoutFailuresTotal.increment();
            inventoryService.releaseReservation(request.checkoutId());
            throw e;
        }
    }

    private boolean matchesOwner(String ownerKey, UUID userId, String sessionId) {
        if (ownerKey.equals(userId.toString())) {
            return true;
        }
        return sessionId != null && !sessionId.isBlank() && ownerKey.equals(sessionId);
    }

    private void clearCheckoutSession(UUID userId, String sessionId, UUID checkoutId) {
        stringRedisTemplate.delete(CHECKOUT_LOCK_PREFIX + userId);
        if (sessionId != null && !sessionId.isBlank()) {
            stringRedisTemplate.delete(CHECKOUT_LOCK_PREFIX + sessionId);
        }
        stringRedisTemplate.delete(checkoutSessionKey(checkoutId));
    }

    private String checkoutSessionKey(UUID checkoutId) {
        return "checkout:" + checkoutId;
    }
}
