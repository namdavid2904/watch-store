package com.watchstore.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public record CheckoutConfirmRequest(
        @NotNull UUID checkoutId,
        Map<String, Object> shippingAddress
) {
}
