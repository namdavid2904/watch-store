package com.watchstore.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieService {

    public static final String REFRESH_COOKIE_NAME = "refresh_token";

    @Value("${app.auth.refresh-cookie-secure:false}")
    private boolean secure;

    @Value("${app.auth.refresh-cookie-same-site:Lax}")
    private String sameSite;

    public void setRefreshTokenCookie(HttpServletResponse response, String refreshToken, long maxAgeMs) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(refreshToken, maxAgeMs / 1000).toString());
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", 0).toString());
    }

    private ResponseCookie buildCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .path("/api/v1/auth")
                .sameSite(sameSite)
                .maxAge(maxAgeSeconds)
                .build();
    }

    public Optional<String> readRefreshToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> !value.isBlank())
                .findFirst();
    }
}
