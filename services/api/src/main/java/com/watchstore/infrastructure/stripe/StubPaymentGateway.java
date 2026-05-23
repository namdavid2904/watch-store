package com.watchstore.infrastructure.stripe;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.stripe.enabled", havingValue = "false", matchIfMissing = true)
@RequiredArgsConstructor
public class StubPaymentGateway implements PaymentGateway {

    private final PaymentWebhookHandler paymentWebhookHandler;

    @Override
    public PaymentIntentResult createPaymentIntent(
            UUID orderId,
            BigDecimal amount,
            String currency,
            Map<String, String> metadata) {
        String paymentIntentId = "pi_stub_" + orderId;
        return new PaymentIntentResult(paymentIntentId, "cs_stub_" + orderId);
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        return true;
    }

    @Override
    public void handlePaymentSucceeded(String paymentIntentId) {
        paymentWebhookHandler.markOrderPaid(paymentIntentId);
    }
}
