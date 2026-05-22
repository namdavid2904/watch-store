package com.watchstore.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.watchstore.domain.entity.Product;
import com.watchstore.domain.enums.MovementType;
import com.watchstore.repository.BrandRepository;
import com.watchstore.repository.CategoryRepository;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
class FlywayMigrationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Test
    void migrationsSeedCatalogData() {
        assertThat(brandRepository.count()).isEqualTo(6);
        assertThat(categoryRepository.count()).isEqualTo(4);
        assertThat(productRepository.count()).isEqualTo(20);
        assertThat(inventoryRepository.count()).isEqualTo(20);
    }

    @Test
    void productEntitiesPersistWithBrandAndCategoryRelationships() {
        Product submariner = productRepository.findBySlug("rolex-submariner-date").orElseThrow();

        assertThat(submariner.getName()).isEqualTo("Rolex Submariner Date");
        assertThat(submariner.getBrand().getSlug()).isEqualTo("rolex");
        assertThat(submariner.getCategory().getSlug()).isEqualTo("diving-watches");
        assertThat(submariner.getMovementType()).isEqualTo(MovementType.AUTOMATIC);
        assertThat(submariner.getCaseMaterial()).isEqualTo("Oystersteel");
        assertThat(submariner.getWaterResistance()).isEqualTo("300m");
        assertThat(submariner.getMovementReference()).isEqualTo("Calibre 3235");

        assertThat(inventoryRepository.findById(submariner.getId())).isPresent();
    }
}
