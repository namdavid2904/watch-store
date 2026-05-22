package com.watchstore.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@AutoConfigureMockMvc
class CartIntegrationTest extends AbstractIntegrationTest {

    private static final String SUBMARINER_ID = "c1000000-0000-4000-8000-000000000001";
    private static final String DATEJUST_ID = "c1000000-0000-4000-8000-000000000002";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void guestCartPersistsAcrossRequests() throws Exception {
        String sessionId = "guest-session-123";

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":1}
                                """.formatted(SUBMARINER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1));

        mockMvc.perform(get("/api/v1/cart").header("X-Cart-Session-Id", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1))
                .andExpect(jsonPath("$.items[0].productSlug").value("rolex-submariner-date"));
    }

    @Test
    void loginMergesGuestCartIntoUserCart() throws Exception {
        String sessionId = "guest-merge-session";

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":1}
                                """.formatted(SUBMARINER_ID)))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"customer@watchstore.com","password":"Customer123!"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken")
                .asText();

        mockMvc.perform(get("/api/v1/cart").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1));

        mockMvc.perform(get("/api/v1/cart").header("X-Cart-Session-Id", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(0));
    }

    @Test
    void cartClearUpdateAndRemoveItems() throws Exception {
        String sessionId = "guest-cart-crud";

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":2}
                                """.formatted(SUBMARINER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(2));

        mockMvc.perform(put("/api/v1/cart/items/" + SUBMARINER_ID)
                        .header("X-Cart-Session-Id", sessionId)
                        .param("quantity", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(1));

        mockMvc.perform(delete("/api/v1/cart/items/" + SUBMARINER_ID)
                        .header("X-Cart-Session-Id", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(0));

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":1}
                                """.formatted(DATEJUST_ID)))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/cart").header("X-Cart-Session-Id", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(0));
    }

    @Test
    void authenticatedWishlistEndpointsWork() throws Exception {
        String accessToken = loginAsCustomer();

        mockMvc.perform(post("/api/v1/account/wishlist/" + SUBMARINER_ID)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/account/wishlist")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("rolex-submariner-date"));

        mockMvc.perform(delete("/api/v1/account/wishlist/" + SUBMARINER_ID)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());
    }

    private String loginAsCustomer() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"customer@watchstore.com","password":"Customer123!"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken")
                .asText();
    }
}
