package com.watchstore.web.dto;

import com.watchstore.domain.enums.MovementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateProductRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String description,
        @NotNull @Positive BigDecimal price,
        @NotNull UUID brandId,
        @NotNull UUID categoryId,
        String color,
        List<String> images,
        @NotNull MovementType movementType,
        String caseMaterial,
        String caseDimension,
        String waterResistance,
        String caseThickness,
        String powerReserve,
        String movementReference,
        @Positive int initialStock
) {
}
