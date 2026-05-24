package com.watchstore.web.dto;

public record TelemetrySummaryResponse(
        long ordersCreated,
        long checkoutFailures,
        long inventoryConflicts,
        double cacheHitRatio,
        long stripeWebhookEvents
) {
}
