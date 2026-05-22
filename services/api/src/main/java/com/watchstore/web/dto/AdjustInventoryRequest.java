package com.watchstore.web.dto;

import jakarta.validation.constraints.NotNull;

public record AdjustInventoryRequest(
        @NotNull Integer delta
) {
}
