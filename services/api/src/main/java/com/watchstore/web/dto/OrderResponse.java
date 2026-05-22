package com.watchstore.web.dto;

import com.watchstore.domain.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        OrderStatus status,
        BigDecimal totalAmount,
        String paymentIntentId,
        Map<String, Object> shippingAddress,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {
    public record OrderItemResponse(
            UUID id,
            UUID productId,
            String productName,
            int quantity,
            BigDecimal unitPrice
    ) {
    }
}
