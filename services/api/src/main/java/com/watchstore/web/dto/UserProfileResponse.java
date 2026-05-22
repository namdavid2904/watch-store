package com.watchstore.web.dto;

import com.watchstore.domain.enums.Role;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Role role,
        Map<String, Object> shippingAddress,
        Instant createdAt
) {
}
