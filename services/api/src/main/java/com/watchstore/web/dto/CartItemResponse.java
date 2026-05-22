package com.watchstore.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
        UUID productId,
        String productName,
        String productSlug,
        BigDecimal unitPrice,
        String imageUrl,
        int quantity,
        BigDecimal lineTotal
) {
}
