package com.watchstore.web.dto;

public record CheckoutErrorMetric(
        String label,
        long count
) {
}
