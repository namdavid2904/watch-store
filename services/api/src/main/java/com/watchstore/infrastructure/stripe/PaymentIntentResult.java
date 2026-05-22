package com.watchstore.infrastructure.stripe;

public record PaymentIntentResult(String paymentIntentId, String clientSecret) {
}
