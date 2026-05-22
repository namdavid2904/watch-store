package com.watchstore.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateBrandRequest(
        @NotBlank String name,
        @NotBlank String slug
) {
}
