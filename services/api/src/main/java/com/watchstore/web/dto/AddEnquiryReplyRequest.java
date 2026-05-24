package com.watchstore.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddEnquiryReplyRequest(
        @NotBlank @Size(max = 5000) String body
) {
}
