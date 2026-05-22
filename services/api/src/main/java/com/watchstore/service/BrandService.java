package com.watchstore.service;

import com.watchstore.domain.entity.Brand;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.BrandRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.BrandResponse;
import com.watchstore.web.dto.CreateBrandRequest;
import com.watchstore.web.dto.UpdateBrandRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final CatalogCacheService catalogCacheService;

    @Transactional(readOnly = true)
    public List<BrandResponse> listAll() {
        return brandRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BrandResponse create(CreateBrandRequest request) {
        if (brandRepository.findBySlug(request.slug()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Brand slug already exists");
        }
        Brand brand = new Brand();
        brand.setName(request.name());
        brand.setSlug(request.slug());
        brandRepository.save(brand);
        catalogCacheService.invalidateAll();
        return toResponse(brand);
    }

    @Transactional
    public BrandResponse update(UUID id, UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));

        if (request.slug() != null && !request.slug().equals(brand.getSlug())) {
            brandRepository.findBySlug(request.slug()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ApiException(HttpStatus.CONFLICT, "Brand slug already exists");
                }
            });
            brand.setSlug(request.slug());
        }
        if (request.name() != null) {
            brand.setName(request.name());
        }
        catalogCacheService.invalidateAll();
        return toResponse(brand);
    }

    @Transactional
    public void delete(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        if (productRepository.countByBrand_Id(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Brand is referenced by products");
        }
        brandRepository.delete(brand);
        catalogCacheService.invalidateAll();
    }

    private BrandResponse toResponse(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName(), brand.getSlug());
    }
}
