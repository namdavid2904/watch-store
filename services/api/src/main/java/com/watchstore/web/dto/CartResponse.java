package com.watchstore.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        List<CartItemResponse> items,
        int itemCount,
        BigDecimal subtotal,
        List<String> warnings
) {
    public CartResponse(List<CartItemResponse> items, int itemCount, BigDecimal subtotal) {
        this(items, itemCount, subtotal, List.of());
    }
}
