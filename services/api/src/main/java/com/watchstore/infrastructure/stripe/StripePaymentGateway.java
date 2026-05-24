package com.watchstore.infrastructure.stripe;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.watchstore.config.StripeProperties;
import com.watchstore.exception.ApiException;
import com.watchstore.service.StripeWebhookEventService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.stripe.enabled", havingValue = "true")
@RequiredArgsConstructor
public class StripePaymentGateway implements PaymentGateway {

    private final PaymentWebhookHandler paymentWebhookHandler;
    private final StripeProperties stripeProperties;
    private final StripeWebhookEventService stripeWebhookEventService;

    @Override
    public PaymentIntentResult createPaymentIntent(
            UUID orderId,
            BigDecimal amount,
            String currency,
            Map<String, String> metadata) {
        long amountCents = toAmountInCents(amount);
        String normalizedCurrency = currency == null ? "usd" : currency.toLowerCase();

        com.stripe.param.PaymentIntentCreateParams.Builder paramsBuilder =
                com.stripe.param.PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(normalizedCurrency)
                .putMetadata("orderId", orderId.toString())
                .setAutomaticPaymentMethods(
                        com.stripe.param.PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(
                                        com.stripe.param.PaymentIntentCreateParams.AutomaticPaymentMethods
                                                .AllowRedirects.NEVER)
                                .build());

        if (metadata != null) {
            metadata.forEach((key, value) -> {
                if (StringUtils.hasText(key) && value != null) {
                    paramsBuilder.putMetadata(key, value);
                }
            });
        }

        try {
            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());
            if (!StringUtils.hasText(paymentIntent.getClientSecret())) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment provider did not return a client secret");
            }
            log.info("Created Stripe payment intent {} for order {}", paymentIntent.getId(), orderId);
            return new PaymentIntentResult(paymentIntent.getId(), paymentIntent.getClientSecret());
        } catch (com.stripe.exception.StripeException exception) {
            log.warn("Stripe payment intent creation failed for order {}: {}", orderId, exception.getMessage());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to initiate payment with provider");
        }
    }

    @Override
    public void processWebhook(String payload, String signature) {
        if (!StringUtils.hasText(signature)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Missing Stripe-Signature header");
        }
        if (!StringUtils.hasText(stripeProperties.getWebhookSecret())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe webhook secret is not configured");
        }

        try {
            Event event = Webhook.constructEvent(payload, signature, stripeProperties.getWebhookSecret());
            stripeWebhookEventService.processOnce(event.getId(), event.getType(), () -> dispatchEvent(event));
        } catch (SignatureVerificationException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid Stripe webhook signature");
        }
    }

    private void dispatchEvent(Event event) {
        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
            default -> log.debug("Ignoring unsupported Stripe event type {}", event.getType());
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = deserializePaymentIntent(event);
        if (paymentIntent != null && StringUtils.hasText(paymentIntent.getId())) {
            paymentWebhookHandler.markOrderPaid(paymentIntent.getId());
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = deserializePaymentIntent(event);
        if (paymentIntent != null && StringUtils.hasText(paymentIntent.getId())) {
            paymentWebhookHandler.markOrderFailed(paymentIntent.getId());
        }
    }

    private PaymentIntent deserializePaymentIntent(Event event) {
        return event.getDataObjectDeserializer()
                .getObject()
                .filter(PaymentIntent.class::isInstance)
                .map(PaymentIntent.class::cast)
                .orElse(null);
    }

    private long toAmountInCents(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order total must be greater than zero");
        }
        return amount.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }
}
