package com.watchstore.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesChartPoint(
        LocalDate date,
        long orderCount,
        BigDecimal revenue
) {
}
