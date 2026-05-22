package com.watchstore.web.dto;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalOrders,
        long pendingOrders,
        long totalProducts,
        long lowStockProducts,
        BigDecimal totalRevenue,
        long newEnquiries
) {
}
