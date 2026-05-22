package com.watchstore.infrastructure.stripe;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentGateway {

    String createPaymentIntent(UUID orderId, BigDecimal amount, String currency);

    boolean verifyWebhookSignature(String payload, String signature);
}
