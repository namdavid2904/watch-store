package com.watchstore.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record EnquiryRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Email String email,
        @Size(max = 50) String mobile,
        @NotBlank @Size(max = 5000) String message,
        UUID productId,
        @Size(max = 300) String subject,
        @Size(max = 50) String category
) {
}
