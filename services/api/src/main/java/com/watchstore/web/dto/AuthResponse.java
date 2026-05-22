package com.watchstore.web.dto;

import com.watchstore.domain.enums.Role;
import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String email,
        Role role
) {
}
