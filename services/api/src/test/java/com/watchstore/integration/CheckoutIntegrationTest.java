package com.watchstore.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.domain.entity.Inventory;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.repository.OrderRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@AutoConfigureMockMvc
class CheckoutIntegrationTest extends AbstractIntegrationTest {

    private static final String SUBMARINER_ID = "c1000000-0000-4000-8000-000000000001";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @BeforeEach
    void resetCheckoutState() {
        Inventory inventory = inventoryRepository.findById(UUID.fromString(SUBMARINER_ID)).orElseThrow();
        inventory.setQuantityAvailable(3);
        inventory.setQuantityReserved(0);
        inventoryRepository.saveAndFlush(inventory);

        clearRedisKeys("reservation:*");
        clearRedisKeys("checkout:*");
        clearRedisKeys("checkout:lock:*");
        clearRedisKeys("cart:*");
    }

    private void clearRedisKeys(String pattern) {
        Set<String> keys = stringRedisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }

    @Test
    void authenticatedCheckoutCreatesOrderAndClearsCart() throws Exception {
        String accessToken = loginAsCustomer();
        String sessionId = "checkout-flow-session";

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + accessToken)
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":1}
                                """.formatted(SUBMARINER_ID)))
                .andExpect(status().isOk());

        MvcResult initiateResult = mockMvc.perform(post("/api/v1/checkout/initiate")
                        .header("Authorization", "Bearer " + accessToken)
                        .header("X-Cart-Session-Id", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").isNumber())
                .andReturn();

        JsonNode initiateBody = objectMapper.readTree(initiateResult.getResponse().getContentAsString());
        String checkoutId = initiateBody.get("checkoutId").asText();

        MvcResult confirmResult = mockMvc.perform(post("/api/v1/checkout/confirm")
                        .header("Authorization", "Bearer " + accessToken)
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "checkoutId":"%s",
                                  "shippingAddress": {
                                    "line1":"123 Main St",
                                    "city":"New York",
                                    "postalCode":"10001",
                                    "country":"US"
                                  }
                                }
                                """.formatted(checkoutId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.paymentClientSecret").exists())
                .andExpect(jsonPath("$.paymentIntentId").exists())
                .andReturn();

        String orderId = objectMapper.readTree(confirmResult.getResponse().getContentAsString())
                .get("orderId")
                .asText();

        mockMvc.perform(get("/api/v1/cart").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itemCount").value(0));

        mockMvc.perform(get("/api/v1/orders/" + orderId).header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId))
                .andExpect(jsonPath("$.items[0].productName").value("Rolex Submariner Date"));

        assertThat(orderRepository.findById(UUID.fromString(orderId))).isPresent();
    }

    @Test
    void concurrentPurchaseForLastItemAllowsOnlyOneCheckout() throws Exception {
        UUID productId = UUID.fromString(SUBMARINER_ID);
        Inventory inventory = inventoryRepository.findById(productId).orElseThrow();
        inventory.setQuantityAvailable(1);
        inventory.setQuantityReserved(0);
        inventoryRepository.saveAndFlush(inventory);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            List<Callable<Integer>> tasks = List.of(
                    () -> initiateCheckout("concurrent-session-a"),
                    () -> initiateCheckout("concurrent-session-b")
            );

            List<Future<Integer>> results = executor.invokeAll(tasks);
            List<Integer> statuses = new ArrayList<>();
            for (Future<Integer> result : results) {
                statuses.add(result.get());
            }

            assertThat(statuses).containsExactlyInAnyOrder(200, 409);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void stripeWebhookMarksPendingOrderAsPaid() throws Exception {
        String accessToken = loginAsCustomer();
        String sessionId = "webhook-checkout-session";

        mockMvc.perform(post("/api/v1/cart/items")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":1}
                                """.formatted(SUBMARINER_ID)))
                .andExpect(status().isOk());

        MvcResult initiateResult = mockMvc.perform(post("/api/v1/checkout/initiate")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andReturn();

        String checkoutId = objectMapper.readTree(initiateResult.getResponse().getContentAsString())
                .get("checkoutId")
                .asText();

        MvcResult confirmResult = mockMvc.perform(post("/api/v1/checkout/confirm")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "checkoutId":"%s",
                                  "shippingAddress": {"line1":"1 Test Way","city":"Boston","postalCode":"02108","country":"US"}
                                }
                                """.formatted(checkoutId)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode confirmBody = objectMapper.readTree(confirmResult.getResponse().getContentAsString());
        String paymentIntentId = confirmBody.get("paymentIntentId").asText();
        String orderId = confirmBody.get("orderId").asText();

        mockMvc.perform(post("/api/v1/webhooks/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type":"payment_intent.succeeded",
                                  "data":{"object":{"id":"%s"}}
                                }
                                """.formatted(paymentIntentId)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/orders/" + orderId).header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"));
    }

    private int initiateCheckout(String sessionId) throws Exception {
        mockMvc.perform(post("/api/v1/cart/items")
                        .header("X-Cart-Session-Id", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":"%s","quantity":1}
                                """.formatted(SUBMARINER_ID)))
                .andExpect(status().isOk());

        MvcResult result = mockMvc.perform(post("/api/v1/checkout/initiate")
                        .header("X-Cart-Session-Id", sessionId))
                .andReturn();

        return result.getResponse().getStatus();
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
