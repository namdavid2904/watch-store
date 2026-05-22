package com.watchstore.service;

import com.watchstore.domain.entity.Product;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.PageResponse;
import com.watchstore.web.dto.ProductFilterRequest;
import com.watchstore.web.dto.ProductResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CatalogSearchService {

    private final ProductRepository productRepository;
    private final ProductSpecificationBuilder specificationBuilder;
    private final ProductMapper productMapper;
    private final CatalogCacheService catalogCacheService;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(ProductFilterRequest filter) {
        return catalogCacheService.getOrCompute(filter, () -> {
            Specification<Product> spec = specificationBuilder.build(filter);
            PageRequest pageRequest = PageRequest.of(filter.page(), filter.size(), parseSort(filter.sort()));
            Page<Product> page = productRepository.findAll(spec, pageRequest);
            List<ProductResponse> content = page.getContent().stream()
                    .map(productMapper::toResponse)
                    .toList();
            return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
        });
    }

    private Sort parseSort(String sort) {
        String[] parts = sort.split(",");
        if (parts.length == 2) {
            return Sort.by(Sort.Direction.fromString(parts[1]), parts[0]);
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }
}
