package com.watchstore.web.controller;

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

    @PostMapping
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        if (!paymentGateway.verifyWebhookSignature(payload, signature)) {
            return ResponseEntity.badRequest().body(Map.of("status", "invalid_signature"));
        }
        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
