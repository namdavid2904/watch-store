package com.watchstore.web.dto;

import java.util.UUID;

public record InventoryResponse(
        UUID productId,
        String productName,
        int quantityAvailable,
        int quantityReserved,
        int quantityTotal
) {
}
