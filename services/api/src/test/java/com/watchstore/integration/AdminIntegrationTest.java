package com.watchstore.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.domain.entity.Inventory;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.repository.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@AutoConfigureMockMvc
class AdminIntegrationTest extends AbstractIntegrationTest {

    private static final String SUBMARINER_ID = "c1000000-0000-4000-8000-000000000001";
    private static final String CUSTOMER_ID = "d1000000-0000-4000-8000-000000000002";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void resetInventory() {
        Inventory inventory = inventoryRepository.findById(UUID.fromString(SUBMARINER_ID)).orElseThrow();
        inventory.setQuantityAvailable(3);
        inventory.setQuantityReserved(0);
        inventoryRepository.saveAndFlush(inventory);
    }

    @Test
    void adminCanViewDashboardStatsAndSalesChart() throws Exception {
        String adminToken = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").isNumber());

        mockMvc.perform(get("/api/v1/admin/dashboard/sales-chart?days=7")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void adminCanFilterLowStockInventoryAndAdjustStock() throws Exception {
        String adminToken = loginAsAdmin();
        Inventory inventory = inventoryRepository.findById(UUID.fromString(SUBMARINER_ID)).orElseThrow();
        inventory.setQuantityAvailable(2);
        inventoryRepository.saveAndFlush(inventory);

        mockMvc.perform(get("/api/v1/admin/inventory?lowStock=true")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.productId=='" + SUBMARINER_ID + "')]").exists());

        mockMvc.perform(patch("/api/v1/admin/inventory/" + SUBMARINER_ID)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"delta":5}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityAvailable").value(7));
    }

    @Test
    void adminCanManageBrandsCategoriesUsersAndOrders() throws Exception {
        String adminToken = loginAsAdmin();

        MvcResult brandResult = mockMvc.perform(post("/api/v1/admin/brands")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Grand Seiko","slug":"grand-seiko"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        String brandId = objectMapper.readTree(brandResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(put("/api/v1/admin/brands/" + brandId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Grand Seiko Heritage","slug":"grand-seiko-heritage"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Grand Seiko Heritage"));

        MvcResult categoryResult = mockMvc.perform(post("/api/v1/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Pilot","slug":"pilot"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        String categoryId = objectMapper.readTree(categoryResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").exists())
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist());

        mockMvc.perform(put("/api/v1/admin/users/" + CUSTOMER_ID + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"role":"ADMIN"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        assertThat(userRepository.findById(UUID.fromString(CUSTOMER_ID)).orElseThrow().getRole().name())
                .isEqualTo("ADMIN");

        mockMvc.perform(get("/api/v1/admin/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    private String loginAsAdmin() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin@watchstore.com","password":"Admin123!"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken")
                .asText();
    }
}
