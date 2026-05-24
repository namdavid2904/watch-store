package com.watchstore.web.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID productId,
        UUID userId,
        String reviewerName,
        short rating,
        String title,
        String body,
        Integer wristSizeMm,
        String caseFit,
        boolean verifiedPurchase,
        Instant createdAt
) {
}
