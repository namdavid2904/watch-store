package com.watchstore.infrastructure.stripe;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.watchstore.exception.ApiException;
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

    @Override
    public PaymentIntentResult createPaymentIntent(
            UUID orderId,
            BigDecimal amount,
            String currency,
            Map<String, String> metadata) {
        long amountCents = toAmountInCents(amount);
        String normalizedCurrency = currency == null ? "usd" : currency.toLowerCase();

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(normalizedCurrency)
                .putMetadata("orderId", orderId.toString())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
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
        } catch (StripeException exception) {
            log.warn("Stripe payment intent creation failed for order {}: {}", orderId, exception.getMessage());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to initiate payment with provider");
        }
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        return signature != null && !signature.isBlank();
    }

    @Override
    public void handlePaymentSucceeded(String paymentIntentId) {
        paymentWebhookHandler.markOrderPaid(paymentIntentId);
    }

    private long toAmountInCents(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order total must be greater than zero");
        }
        return amount.setScale(2, RoundingMode.HALF_UP).movePointRight(2).longValueExact();
    }
}
