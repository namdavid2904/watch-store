package com.watchstore.service;

import com.watchstore.domain.entity.Product;
import com.watchstore.web.dto.ProductFilterRequest;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ProductSpecificationBuilder {

    public Specification<Product> build(ProductFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.movementType() != null) {
                predicates.add(cb.equal(root.get("movementType"), filter.movementType()));
            }
            if (filter.brandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.brandId()));
            }
            if (filter.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.categoryId()));
            }
            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
            }
            if (StringUtils.hasText(filter.caseMaterial())) {
                predicates.add(cb.equal(cb.lower(root.get("caseMaterial")), filter.caseMaterial().toLowerCase()));
            }
            if (StringUtils.hasText(filter.color())) {
                predicates.add(cb.equal(cb.lower(root.get("color")), filter.color().toLowerCase()));
            }
            if (StringUtils.hasText(filter.search())) {
                predicates.add(cb.isTrue(
                        cb.function("fts", Boolean.class, root.get("searchVector"), cb.literal(filter.search()))
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
