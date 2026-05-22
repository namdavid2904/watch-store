package com.watchstore.web.dto;

import com.watchstore.domain.enums.OrderStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record CheckoutConfirmResponse(
        UUID orderId,
        OrderStatus status,
        BigDecimal totalAmount,
        String paymentIntentId
) {
}
