package com.watchstore.service;

import com.watchstore.domain.entity.Product;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.web.dto.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final InventoryRepository inventoryRepository;

    public ProductResponse toResponse(Product product) {
        Integer quantityAvailable = inventoryRepository.findById(product.getId())
                .map(inv -> inv.getQuantityAvailable())
                .orElse(0);

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getBrand().getId(),
                product.getBrand().getName(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getColor(),
                product.getImages(),
                product.getModel3dUrl(),
                product.getGalleryImages(),
                product.getMovementType(),
                product.getCaseMaterial(),
                product.getCaseDimension(),
                product.getWaterResistance(),
                product.getCaseThickness(),
                product.getPowerReserve(),
                product.getMovementReference(),
                quantityAvailable,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
