package com.watchstore.web.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.infrastructure.stripe.PaymentGateway;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final PaymentGateway paymentGateway;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        if (!paymentGateway.verifyWebhookSignature(payload, signature)) {
            return ResponseEntity.badRequest().body(Map.of("status", "invalid_signature"));
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("type").asText();
            if ("payment_intent.succeeded".equals(eventType)) {
                String paymentIntentId = root.path("data").path("object").path("id").asText(null);
                if (paymentIntentId != null && !paymentIntentId.isBlank()) {
                    paymentGateway.handlePaymentSucceeded(paymentIntentId);
                }
            }
        } catch (Exception ignored) {
            // Stub webhook accepts minimal payloads during development.
        }

        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
