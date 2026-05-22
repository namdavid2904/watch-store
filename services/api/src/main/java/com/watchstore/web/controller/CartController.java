package com.watchstore.web.controller;

import com.watchstore.security.SecurityUtils;
import com.watchstore.service.CartService;
import com.watchstore.web.dto.AddCartItemRequest;
import com.watchstore.web.dto.CartResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId) {
        UUID userId = SecurityUtils.getCurrentUser().map(u -> u.getId()).orElse(null);
        return ResponseEntity.ok(cartService.getCart(userId, sessionId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId,
            @Valid @RequestBody AddCartItemRequest request) {
        UUID userId = SecurityUtils.getCurrentUser().map(u -> u.getId()).orElse(null);
        return ResponseEntity.ok(cartService.addItem(userId, sessionId, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItem(
            @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId,
            @PathVariable UUID productId,
            @RequestParam int quantity) {
        UUID userId = SecurityUtils.getCurrentUser().map(u -> u.getId()).orElse(null);
        return ResponseEntity.ok(cartService.updateItemQuantity(userId, sessionId, productId, quantity));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
            @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId,
            @PathVariable UUID productId) {
        UUID userId = SecurityUtils.getCurrentUser().map(u -> u.getId()).orElse(null);
        return ResponseEntity.ok(cartService.removeItem(userId, sessionId, productId));
    }
}
