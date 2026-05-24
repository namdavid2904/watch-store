package com.watchstore.web.dto;

import java.util.UUID;

public record InventoryHealthItem(
        UUID productId,
        String productName,
        String brandName,
        int quantityAvailable,
        long unitsSoldLast7Days,
        int daysUntilStockout
) {
}
