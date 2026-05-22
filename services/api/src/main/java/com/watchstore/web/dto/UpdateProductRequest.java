package com.watchstore.web.dto;

import com.watchstore.domain.enums.MovementType;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpdateProductRequest(
        String name,
        String slug,
        String description,
        @Positive BigDecimal price,
        UUID brandId,
        UUID categoryId,
        String color,
        List<String> images,
        MovementType movementType,
        String caseMaterial,
        String caseDimension,
        String waterResistance,
        String caseThickness,
        String powerReserve,
        String movementReference
) {
}
