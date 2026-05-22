package com.watchstore.web.dto;

import com.watchstore.domain.enums.Role;
import java.util.UUID;

public record PublicAuthResponse(
        String accessToken,
        UUID userId,
        String email,
        Role role
) {
    public static PublicAuthResponse from(AuthResponse response) {
        return new PublicAuthResponse(
                response.accessToken(),
                response.userId(),
                response.email(),
                response.role());
    }
}
