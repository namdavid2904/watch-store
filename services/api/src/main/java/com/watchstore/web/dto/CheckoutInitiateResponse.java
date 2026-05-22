package com.watchstore.web.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CheckoutInitiateResponse(
        UUID checkoutId,
        BigDecimal totalAmount,
        List<CheckoutLineItem> items,
        long expiresAtEpochSeconds
) {
    public record CheckoutLineItem(UUID productId, String productName, int quantity, BigDecimal unitPrice) {
    }
}
