package com.watchstore.infrastructure.stripe;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.service.StripeWebhookEventService;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.stripe.enabled", havingValue = "false", matchIfMissing = true)
@RequiredArgsConstructor
public class StubPaymentGateway implements PaymentGateway {

    private final PaymentWebhookHandler paymentWebhookHandler;
    private final StripeWebhookEventService stripeWebhookEventService;
    private final ObjectMapper objectMapper;

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
    public void processWebhook(String payload, String signature) {
        if (signature == null || signature.isBlank()) {
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("type").asText();
            String eventId = root.path("id").asText(null);
            if (!StringUtils.hasText(eventId)) {
                String paymentIntentId = root.path("data").path("object").path("id").asText();
                eventId = "evt_stub_" + paymentIntentId;
            }

            stripeWebhookEventService.processOnce(eventId, eventType, () -> dispatchStubEvent(eventType, root));
        } catch (Exception exception) {
            log.debug("Ignoring malformed stub webhook payload: {}", exception.getMessage());
        }
    }

    private void dispatchStubEvent(String eventType, JsonNode root) {
        String paymentIntentId = root.path("data").path("object").path("id").asText(null);
        if (!StringUtils.hasText(paymentIntentId)) {
            return;
        }

        if ("payment_intent.succeeded".equals(eventType)) {
            paymentWebhookHandler.markOrderPaid(paymentIntentId);
        } else if ("payment_intent.payment_failed".equals(eventType)) {
            paymentWebhookHandler.markOrderFailed(paymentIntentId);
        }
    }
}
