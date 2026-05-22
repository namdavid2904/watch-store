package com.watchstore.integration;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@AutoConfigureMockMvc
class ProductCatalogIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listProductsReturnsSeededCatalog() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(20)))
                .andExpect(jsonPath("$.totalElements").value(20))
                .andExpect(jsonPath("$.content[0].brandName").exists())
                .andExpect(jsonPath("$.content[0].movementType").exists());
    }

    @Test
    void getProductBySlugReturnsWatchSpecs() throws Exception {
        mockMvc.perform(get("/api/v1/products/rolex-submariner-date"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("rolex-submariner-date"))
                .andExpect(jsonPath("$.brandName").value("Rolex"))
                .andExpect(jsonPath("$.movementType").value("AUTOMATIC"))
                .andExpect(jsonPath("$.caseMaterial").value("Oystersteel"))
                .andExpect(jsonPath("$.quantityAvailable").value(greaterThanOrEqualTo(0)));
    }

    @Test
    void filterProductsByMovementType() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("movementType", "QUARTZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    void filterProductsByBrandAndPriceRange() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                        .param("brandId", "a1000000-0000-4000-8000-000000000001")
                        .param("minPrice", "5000")
                        .param("maxPrice", "11000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.content[0].brandName").value("Rolex"));
    }

    @Test
    void fullTextSearchFindsSeededProduct() throws Exception {
        mockMvc.perform(get("/api/v1/products").param("search", "submariner"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.content[0].slug").value("rolex-submariner-date"));
    }

    @Test
    void listBrandsAndCategories() throws Exception {
        mockMvc.perform(get("/api/v1/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    void repeatedCatalogRequestsStayFastWhenCached() throws Exception {
        long firstDurationMs = timedCatalogRequest();
        long secondDurationMs = timedCatalogRequest();

        mockMvc.perform(get("/api/v1/products")
                        .param("movementType", "AUTOMATIC")
                        .param("sort", "price,asc"))
                .andExpect(status().isOk());

        org.assertj.core.api.Assertions.assertThat(secondDurationMs)
                .isLessThanOrEqualTo(Math.max(firstDurationMs, 1L));
        org.assertj.core.api.Assertions.assertThat(secondDurationMs)
                .isLessThan(100L);
    }

    private long timedCatalogRequest() throws Exception {
        long start = System.nanoTime();
        mockMvc.perform(get("/api/v1/products")
                        .param("movementType", "AUTOMATIC")
                        .param("sort", "price,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(greaterThanOrEqualTo(1)));
        return (System.nanoTime() - start) / 1_000_000;
    }
}
