package com.watchstore.web.controller;

import com.watchstore.domain.enums.MovementType;
import com.watchstore.service.CatalogSearchService;
import com.watchstore.service.ProductService;
import com.watchstore.web.dto.PageResponse;
import com.watchstore.web.dto.ProductFilterRequest;
import com.watchstore.web.dto.ProductResponse;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final CatalogSearchService catalogSearchService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> listProducts(
            @RequestParam(required = false) MovementType movementType,
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String caseMaterial,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        ProductFilterRequest filter = new ProductFilterRequest(
                movementType, brandId, categoryId, minPrice, maxPrice,
                caseMaterial, color, search, page, size, sort);
        return ResponseEntity.ok(catalogSearchService.search(filter));
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String idOrSlug) {
        try {
            UUID id = UUID.fromString(idOrSlug);
            return ResponseEntity.ok(productService.getById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(productService.getBySlug(idOrSlug));
        }
    }
}
