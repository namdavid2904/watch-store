package com.watchstore.infrastructure.redis;

import java.math.BigDecimal;
import java.time.Instant;

public record CartEntry(
        int quantity,
        BigDecimal unitPrice,
        Instant addedAt
) {
}
