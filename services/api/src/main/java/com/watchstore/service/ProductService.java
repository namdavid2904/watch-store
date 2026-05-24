package com.watchstore.service;

import com.watchstore.domain.entity.Brand;
import com.watchstore.domain.entity.Category;
import com.watchstore.domain.entity.Inventory;
import com.watchstore.domain.entity.Product;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.BrandRepository;
import com.watchstore.repository.CategoryRepository;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.CreateProductRequest;
import com.watchstore.web.dto.ProductResponse;
import com.watchstore.web.dto.UpdateProductRequest;
import java.util.ArrayList;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;
    private final CatalogCacheService catalogCacheService;

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (productRepository.findBySlug(request.slug()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Product slug already exists");
        }

        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = new Product();
        applyCreateRequest(product, request, brand, category);
        productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantityAvailable(request.initialStock());
        inventoryRepository.save(inventory);

        catalogCacheService.invalidateAll();
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (request.slug() != null && !request.slug().equals(product.getSlug())) {
            productRepository.findBySlug(request.slug()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ApiException(HttpStatus.CONFLICT, "Product slug already exists");
                }
            });
        }

        if (request.name() != null) {
            product.setName(request.name());
        }
        if (request.slug() != null) {
            product.setSlug(request.slug());
        }
        if (request.description() != null) {
            product.setDescription(request.description());
        }
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.brandId() != null) {
            Brand brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
            product.setBrand(brand);
        }
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
        if (request.color() != null) {
            product.setColor(request.color());
        }
        if (request.images() != null) {
            product.setImages(new ArrayList<>(request.images()));
        }
        if (request.movementType() != null) {
            product.setMovementType(request.movementType());
        }
        if (request.caseMaterial() != null) {
            product.setCaseMaterial(request.caseMaterial());
        }
        if (request.caseDimension() != null) {
            product.setCaseDimension(request.caseDimension());
        }
        if (request.waterResistance() != null) {
            product.setWaterResistance(request.waterResistance());
        }
        if (request.caseThickness() != null) {
            product.setCaseThickness(request.caseThickness());
        }
        if (request.powerReserve() != null) {
            product.setPowerReserve(request.powerReserve());
        }
        if (request.movementReference() != null) {
            product.setMovementReference(request.movementReference());
        }

        catalogCacheService.invalidateAll();
        return productMapper.toResponse(product);
    }

    @Transactional
    public void delete(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
        catalogCacheService.invalidateAll();
    }

    @Transactional
    public ProductResponse addImage(UUID id, String imageKey) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.getImages().add(imageKey);
        catalogCacheService.invalidateAll();
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse setModel3dUrl(UUID id, String modelKey) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setModel3dUrl(modelKey);
        catalogCacheService.invalidateAll();
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse addGalleryImage(UUID id, String imageKey) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.getGalleryImages().add(imageKey);
        catalogCacheService.invalidateAll();
        return productMapper.toResponse(product);
    }

    private void applyCreateRequest(Product product, CreateProductRequest request, Brand brand, Category category) {
        product.setName(request.name());
        product.setSlug(request.slug());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setBrand(brand);
        product.setCategory(category);
        product.setColor(request.color());
        product.setImages(request.images() != null ? new ArrayList<>(request.images()) : new ArrayList<>());
        product.setMovementType(request.movementType());
        product.setCaseMaterial(request.caseMaterial());
        product.setCaseDimension(request.caseDimension());
        product.setWaterResistance(request.waterResistance());
        product.setCaseThickness(request.caseThickness());
        product.setPowerReserve(request.powerReserve());
        product.setMovementReference(request.movementReference());
    }
}
