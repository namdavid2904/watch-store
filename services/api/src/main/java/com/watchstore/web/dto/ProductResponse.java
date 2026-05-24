package com.watchstore.web.dto;

import com.watchstore.domain.enums.MovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        UUID brandId,
        String brandName,
        UUID categoryId,
        String categoryName,
        String color,
        List<String> images,
        String model3dUrl,
        List<String> galleryImages,
        MovementType movementType,
        String caseMaterial,
        String caseDimension,
        String waterResistance,
        String caseThickness,
        String powerReserve,
        String movementReference,
        Integer quantityAvailable,
        Instant createdAt,
        Instant updatedAt
) {
}
