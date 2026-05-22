package com.watchstore.web.controller;

import com.watchstore.security.AuthCookieService;
import com.watchstore.security.JwtTokenProvider;
import com.watchstore.security.SecurityUtils;
import com.watchstore.service.AuthService;
import com.watchstore.service.CartService;
import com.watchstore.web.dto.AuthLoginRequest;
import com.watchstore.web.dto.AuthRegisterRequest;
import com.watchstore.web.dto.AuthResponse;
import com.watchstore.web.dto.PublicAuthResponse;
import com.watchstore.web.dto.TokenRefreshRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
    private final AuthCookieService authCookieService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<PublicAuthResponse> register(@Valid @RequestBody AuthRegisterRequest request,
                                                       @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId,
                                                       HttpServletResponse response) {
        AuthResponse tokens = authService.register(request);
        cartService.mergeGuestCartIntoUser(tokens.userId(), sessionId);
        writeRefreshCookie(response, tokens);
        return ResponseEntity.status(HttpStatus.CREATED).body(PublicAuthResponse.from(tokens));
    }

    @PostMapping("/login")
    public ResponseEntity<PublicAuthResponse> login(@Valid @RequestBody AuthLoginRequest request,
                                                    @RequestHeader(value = "X-Cart-Session-Id", required = false) String sessionId,
                                                    HttpServletResponse response) {
        AuthResponse tokens = authService.login(request);
        cartService.mergeGuestCartIntoUser(tokens.userId(), sessionId);
        writeRefreshCookie(response, tokens);
        return ResponseEntity.ok(PublicAuthResponse.from(tokens));
    }

    @PostMapping("/refresh")
    public ResponseEntity<PublicAuthResponse> refresh(@RequestBody(required = false) TokenRefreshRequest request,
                                                      HttpServletRequest httpRequest,
                                                      HttpServletResponse response) {
        String refreshToken = authCookieService.readRefreshToken(httpRequest)
                .orElseGet(() -> request != null ? request.refreshToken() : null);

        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AuthResponse tokens = authService.refresh(refreshToken);
        writeRefreshCookie(response, tokens);
        return ResponseEntity.ok(PublicAuthResponse.from(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authService.logout(SecurityUtils.requireCurrentUserId());
        authCookieService.clearRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/oauth2/success")
    public ResponseEntity<Map<String, String>> oauth2Success() {
        return ResponseEntity.ok(Map.of(
                "message", "OAuth2 login redirects to the frontend callback with an access token"));
    }

    private void writeRefreshCookie(HttpServletResponse response, AuthResponse tokens) {
        authCookieService.setRefreshTokenCookie(
                response,
                tokens.refreshToken(),
                jwtTokenProvider.getRefreshTokenExpirationMs());
    }
}
