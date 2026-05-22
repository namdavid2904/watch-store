package com.watchstore.web.dto;

import com.watchstore.domain.enums.MovementType;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductFilterRequest(
        MovementType movementType,
        UUID brandId,
        UUID categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String caseMaterial,
        String color,
        String search,
        int page,
        int size,
        String sort
) {
    public ProductFilterRequest {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 20;
        }
        if (sort == null || sort.isBlank()) {
            sort = "createdAt,desc";
        }
    }
}
