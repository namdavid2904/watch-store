package com.watchstore.web.controller;

import com.watchstore.security.SecurityUtils;
import com.watchstore.service.AuthService;
import com.watchstore.service.CartService;
import com.watchstore.web.dto.AuthLoginRequest;
import com.watchstore.web.dto.AuthRegisterRequest;
import com.watchstore.web.dto.AuthResponse;
import com.watchstore.web.dto.TokenRefreshRequest;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CartService cartService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthLoginRequest request,
                                              @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId) {
        AuthResponse response = authService.login(request);
        cartService.mergeGuestCartIntoUser(response.userId(), sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        authService.logout(SecurityUtils.requireCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<Map<String, String>> oauth2Success() {
        return ResponseEntity.ok(Map.of(
                "message", "OAuth2 login is handled via redirect with tokens in query parameters"));
    }
}
