package com.watchstore.infrastructure.stripe;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public interface PaymentGateway {

    PaymentIntentResult createPaymentIntent(
            UUID orderId,
            BigDecimal amount,
            String currency,
            Map<String, String> metadata);

    void processWebhook(String payload, String signature);
}
