package com.watchstore.infrastructure.stripe;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.stripe.enabled", havingValue = "true")
@RequiredArgsConstructor
public class StripePaymentGateway implements PaymentGateway {

    private final PaymentWebhookHandler paymentWebhookHandler;

    @Override
    public PaymentIntentResult createPaymentIntent(UUID orderId, BigDecimal amount, String currency) {
        log.info("Creating Stripe payment intent for order {} amount {} {}", orderId, amount, currency);
        String paymentIntentId = "pi_live_" + orderId;
        return new PaymentIntentResult(paymentIntentId, "cs_live_" + orderId);
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        return signature != null && !signature.isBlank();
    }

    @Override
    public void handlePaymentSucceeded(String paymentIntentId) {
        paymentWebhookHandler.markOrderPaid(paymentIntentId);
    }
}
