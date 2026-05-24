package com.watchstore.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddEnquiryTagRequest(
        @NotBlank @Size(max = 50) String tag
) {
}
