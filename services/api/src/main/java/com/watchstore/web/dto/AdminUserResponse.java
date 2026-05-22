package com.watchstore.web.dto;

import com.watchstore.domain.enums.Role;
import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Role role,
        Instant createdAt
) {
}
