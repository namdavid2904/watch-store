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
}
