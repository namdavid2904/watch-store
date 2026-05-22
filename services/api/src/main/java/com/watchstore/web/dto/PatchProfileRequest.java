package com.watchstore.web.dto;

import jakarta.validation.constraints.Size;
import java.util.Map;

public record PatchProfileRequest(
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        Map<String, Object> shippingAddress
) {
}
