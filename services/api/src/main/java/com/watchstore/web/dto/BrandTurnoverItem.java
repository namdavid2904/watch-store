package com.watchstore.web.dto;

import java.math.BigDecimal;

public record BrandTurnoverItem(
        String brandName,
        long unitsSold,
        BigDecimal revenue
) {
}
