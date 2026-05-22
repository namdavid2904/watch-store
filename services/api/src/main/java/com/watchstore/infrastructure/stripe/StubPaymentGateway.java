package com.watchstore.infrastructure.stripe;

import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.stripe.enabled", havingValue = "false", matchIfMissing = true)
public class StubPaymentGateway implements PaymentGateway {

    @Override
    public String createPaymentIntent(UUID orderId, BigDecimal amount, String currency) {
        return "pi_stub_" + orderId;
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        return true;
    }
}
