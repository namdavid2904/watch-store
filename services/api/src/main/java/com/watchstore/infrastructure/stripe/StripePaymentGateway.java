package com.watchstore.infrastructure.stripe;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.stripe.enabled", havingValue = "true")
public class StripePaymentGateway implements PaymentGateway {

    @Override
    public String createPaymentIntent(UUID orderId, BigDecimal amount, String currency) {
        log.info("Creating Stripe payment intent for order {} amount {} {}", orderId, amount, currency);
        return "pi_stub_" + orderId;
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        return signature != null && !signature.isBlank();
    }
}
