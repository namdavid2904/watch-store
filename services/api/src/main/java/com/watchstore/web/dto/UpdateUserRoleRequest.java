package com.watchstore.web.dto;

import com.watchstore.domain.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull Role role
) {
}
