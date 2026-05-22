package com.watchstore.service;

import com.watchstore.domain.entity.Product;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.infrastructure.redis.CartEntry;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.AddCartItemRequest;
import com.watchstore.web.dto.CartItemResponse;
import com.watchstore.web.dto.CartResponse;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Iterator;
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
    private static final Duration AUTH_TTL = Duration.ofDays(30);
    private static final Duration GUEST_TTL = Duration.ofDays(7);

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;

    public CartResponse getCart(UUID userId, String sessionId) {
        String key = cartKey(userId, sessionId);
        Map<Object, Object> entries = hashOps().entries(key);
        return buildCartResponse(key, entries);
    }

    public CartResponse addItem(UUID userId, String sessionId, AddCartItemRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String key = cartKey(userId, sessionId);
        String field = product.getId().toString();
        CartEntry existing = readEntry(hashOps().get(key, field), product.getPrice());
        CartEntry updated = new CartEntry(
                existing.quantity() + request.quantity(),
                product.getPrice(),
                existing.addedAt() != null ? existing.addedAt() : Instant.now()
        );
        hashOps().put(key, field, updated);
        refreshExpiry(key, userId);
        return getCart(userId, sessionId);
    }

    public CartResponse updateItemQuantity(UUID userId, String sessionId, UUID productId, int quantity) {
        String key = cartKey(userId, sessionId);
        if (quantity <= 0) {
            hashOps().delete(key, productId.toString());
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            CartEntry existing = readEntry(hashOps().get(key, productId.toString()), product.getPrice());
            hashOps().put(key, productId.toString(), new CartEntry(quantity, product.getPrice(), existing.addedAt()));
        }
        refreshExpiry(key, userId);
        return getCart(userId, sessionId);
    }

    public CartResponse removeItem(UUID userId, String sessionId, UUID productId) {
        String key = cartKey(userId, sessionId);
        hashOps().delete(key, productId.toString());
        refreshExpiry(key, userId);
        return getCart(userId, sessionId);
    }

    public CartResponse clearCart(UUID userId, String sessionId) {
        redisTemplate.delete(cartKey(userId, sessionId));
        return new CartResponse(List.of(), 0, BigDecimal.ZERO, List.of());
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
            Product product = productRepository.findById(UUID.fromString(productId)).orElse(null);
            if (product == null) {
                continue;
            }
            CartEntry guestEntry = readEntry(entry.getValue(), product.getPrice());
            CartEntry existing = readEntry(hashOps().get(userKey, productId), product.getPrice());
            hashOps().put(
                    userKey,
                    productId,
                    new CartEntry(
                            existing.quantity() + guestEntry.quantity(),
                            product.getPrice(),
                            guestEntry.addedAt() != null ? guestEntry.addedAt() : Instant.now()
                    )
            );
        }
        redisTemplate.delete(guestKey);
        refreshExpiry(userKey, userId);
    }

    public Map<UUID, Integer> getCartItems(UUID userId, String sessionId) {
        Map<Object, Object> entries = hashOps().entries(cartKey(userId, sessionId));
        return entries.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> UUID.fromString(e.getKey().toString()),
                        e -> readEntry(e.getValue(), BigDecimal.ZERO).quantity()
                ));
    }

    private CartResponse buildCartResponse(String key, Map<Object, Object> entries) {
        List<CartItemResponse> items = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;

        Iterator<Map.Entry<Object, Object>> iterator = entries.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<Object, Object> entry = iterator.next();
            UUID productId = UUID.fromString(entry.getKey().toString());
            CartEntry cartEntry = readEntry(entry.getValue(), null);
            Product product = productRepository.findById(productId).orElse(null);

            if (product == null) {
                hashOps().delete(key, productId.toString());
                warnings.add("A product in your cart is no longer available and was removed.");
                continue;
            }

            if (cartEntry.unitPrice() != null
                    && cartEntry.unitPrice().compareTo(product.getPrice()) != 0) {
                warnings.add("%s price updated from %s to %s.".formatted(
                        product.getName(),
                        cartEntry.unitPrice(),
                        product.getPrice()));
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(cartEntry.quantity()));
            subtotal = subtotal.add(lineTotal);
            itemCount += cartEntry.quantity();
            String imageUrl = product.getImages().isEmpty() ? null : product.getImages().getFirst();
            items.add(new CartItemResponse(
                    product.getId(),
                    product.getName(),
                    product.getSlug(),
                    product.getPrice(),
                    imageUrl,
                    cartEntry.quantity(),
                    lineTotal
            ));
        }

        return new CartResponse(items, itemCount, subtotal, warnings);
    }

    private CartEntry readEntry(Object value, BigDecimal fallbackPrice) {
        if (value == null) {
            return new CartEntry(0, fallbackPrice, null);
        }
        if (value instanceof CartEntry entry) {
            return entry;
        }
        if (value instanceof Map<?, ?> map) {
            int quantity = map.get("quantity") instanceof Number number ? number.intValue() : 1;
            BigDecimal unitPrice = map.get("unitPrice") instanceof Number price
                    ? BigDecimal.valueOf(((Number) price).doubleValue())
                    : fallbackPrice;
            Instant addedAt = map.get("addedAt") instanceof String text
                    ? Instant.parse(text)
                    : Instant.now();
            return new CartEntry(quantity, unitPrice, addedAt);
        }
        if (value instanceof Number number) {
            return new CartEntry(number.intValue(), fallbackPrice, Instant.now());
        }
        return new CartEntry(1, fallbackPrice, Instant.now());
    }

    private void refreshExpiry(String key, UUID userId) {
        redisTemplate.expire(key, userId != null ? AUTH_TTL : GUEST_TTL);
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
