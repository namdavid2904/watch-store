package com.watchstore.web.controller;

import com.watchstore.exception.ApiException;
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
        try {
            paymentGateway.processWebhook(payload, signature);
            return ResponseEntity.ok(Map.of("status", "received"));
        } catch (ApiException exception) {
            if (exception.getStatus().is4xxClientError()) {
                return ResponseEntity.status(exception.getStatus())
                        .body(Map.of("status", exception.getMessage()));
            }
            throw exception;
        }
    }
}
