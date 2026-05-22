package com.watchstore.service;

import com.watchstore.domain.entity.Category;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.CategoryRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.CategoryResponse;
import com.watchstore.web.dto.CreateCategoryRequest;
import com.watchstore.web.dto.UpdateCategoryRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CatalogCacheService catalogCacheService;

    @Transactional(readOnly = true)
    public List<CategoryResponse> listAll() {
        return categoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categoryRepository.findBySlug(request.slug()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Category slug already exists");
        }
        Category category = new Category();
        category.setName(request.name());
        category.setSlug(request.slug());
        categoryRepository.save(category);
        catalogCacheService.invalidateAll();
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(UUID id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (request.slug() != null && !request.slug().equals(category.getSlug())) {
            categoryRepository.findBySlug(request.slug()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ApiException(HttpStatus.CONFLICT, "Category slug already exists");
                }
            });
            category.setSlug(request.slug());
        }
        if (request.name() != null) {
            category.setName(request.name());
        }
        catalogCacheService.invalidateAll();
        return toResponse(category);
    }

    @Transactional
    public void delete(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (productRepository.countByCategory_Id(id) > 0) {
            throw new ApiException(HttpStatus.CONFLICT, "Category is referenced by products");
        }
        categoryRepository.delete(category);
        catalogCacheService.invalidateAll();
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug());
    }
}
