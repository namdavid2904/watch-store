package com.watchstore.web.controller;

import com.watchstore.security.SecurityUtils;
import com.watchstore.service.CheckoutService;
import com.watchstore.web.dto.CheckoutConfirmRequest;
import com.watchstore.web.dto.CheckoutConfirmResponse;
import com.watchstore.web.dto.CheckoutInitiateResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/initiate")
    public ResponseEntity<CheckoutInitiateResponse> initiate(
            @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId) {
        UUID userId = SecurityUtils.getCurrentUser().map(u -> u.getId()).orElse(null);
        return ResponseEntity.ok(checkoutService.initiate(userId, sessionId));
    }

    @PostMapping("/confirm")
    public ResponseEntity<CheckoutConfirmResponse> confirm(@Valid @RequestBody CheckoutConfirmRequest request) {
        UUID userId = SecurityUtils.requireCurrentUserId();
        return ResponseEntity.ok(checkoutService.confirm(userId, request));
    }
}
