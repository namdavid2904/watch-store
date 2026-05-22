package com.watchstore.service;

import com.watchstore.domain.entity.Product;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.AddCartItemRequest;
import com.watchstore.web.dto.CartItemResponse;
import com.watchstore.web.dto.CartResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final String GUEST_PREFIX = "cart:guest:";
    private static final String USER_PREFIX = "cart:";

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;

    public CartResponse getCart(UUID userId, String sessionId) {
        Map<Object, Object> entries = hashOps().entries(cartKey(userId, sessionId));
        return buildCartResponse(entries);
    }

    public CartResponse addItem(UUID userId, String sessionId, AddCartItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String key = cartKey(userId, sessionId);
        String field = product.getId().toString();
        Object existing = hashOps().get(key, field);
        int newQty = request.quantity();
        if (existing instanceof Number number) {
            newQty += number.intValue();
        }
        hashOps().put(key, field, newQty);
        return getCart(userId, sessionId);
    }

    public CartResponse updateItemQuantity(UUID userId, String sessionId, UUID productId, int quantity) {
        if (quantity <= 0) {
            hashOps().delete(cartKey(userId, sessionId), productId.toString());
        } else {
            hashOps().put(cartKey(userId, sessionId), productId.toString(), quantity);
        }
        return getCart(userId, sessionId);
    }

    public CartResponse removeItem(UUID userId, String sessionId, UUID productId) {
        hashOps().delete(cartKey(userId, sessionId), productId.toString());
        return getCart(userId, sessionId);
    }

    public void clearCart(UUID userId, String sessionId) {
        redisTemplate.delete(cartKey(userId, sessionId));
    }

    public void mergeGuestCartIntoUser(UUID userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }
        String guestKey = GUEST_PREFIX + sessionId;
        String userKey = USER_PREFIX + userId;
        Map<Object, Object> guestItems = hashOps().entries(guestKey);
        if (guestItems.isEmpty()) {
            return;
        }
        for (Map.Entry<Object, Object> entry : guestItems.entrySet()) {
            String productId = entry.getKey().toString();
            int guestQty = ((Number) entry.getValue()).intValue();
            Object existing = hashOps().get(userKey, productId);
            int totalQty = guestQty;
            if (existing instanceof Number number) {
                totalQty += number.intValue();
            }
            hashOps().put(userKey, productId, totalQty);
        }
        redisTemplate.delete(guestKey);
    }

    public Map<UUID, Integer> getCartItems(UUID userId, String sessionId) {
        Map<Object, Object> entries = hashOps().entries(cartKey(userId, sessionId));
        return entries.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> UUID.fromString(e.getKey().toString()),
                        e -> ((Number) e.getValue()).intValue()
                ));
    }

    private CartResponse buildCartResponse(Map<Object, Object> entries) {
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;

        for (Map.Entry<Object, Object> entry : entries.entrySet()) {
            UUID productId = UUID.fromString(entry.getKey().toString());
            int quantity = ((Number) entry.getValue()).intValue();
            Product product = productRepository.findById(productId)
                    .orElse(null);
            if (product == null) {
                continue;
            }
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineTotal);
            itemCount += quantity;
            String imageUrl = product.getImages().isEmpty() ? null : product.getImages().getFirst();
            items.add(new CartItemResponse(
                    product.getId(),
                    product.getName(),
                    product.getSlug(),
                    product.getPrice(),
                    imageUrl,
                    quantity,
                    lineTotal
            ));
        }

        return new CartResponse(items, itemCount, subtotal);
    }

    private String cartKey(UUID userId, String sessionId) {
        if (userId != null) {
            return USER_PREFIX + userId;
        }
        if (sessionId == null || sessionId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart session id required for guest cart");
        }
        return GUEST_PREFIX + sessionId;
    }

    private HashOperations<String, Object, Object> hashOps() {
        return redisTemplate.opsForHash();
    }
}
