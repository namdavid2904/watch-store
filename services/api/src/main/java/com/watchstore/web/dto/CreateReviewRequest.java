package com.watchstore.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
        @Min(1) @Max(5) short rating,
        @Size(max = 200) String title,
        @NotBlank @Size(max = 5000) String body,
        @Min(100) @Max(250) Integer wristSizeMm,
        @Size(max = 50) String caseFit
) {
}
