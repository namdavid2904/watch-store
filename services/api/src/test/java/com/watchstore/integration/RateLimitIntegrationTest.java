package com.watchstore.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@AutoConfigureMockMvc
class RateLimitIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void authEndpointReturnsTooManyRequestsWhenRateLimitExceeded() throws Exception {
        boolean sawRateLimit = false;

        for (int i = 0; i < 40; i++) {
            MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"customer@watchstore.com","password":"wrong-password"}
                                    """))
                    .andReturn();

            int status = result.getResponse().getStatus();
            if (status == 429) {
                sawRateLimit = true;
                break;
            }
            assertThat(status).isIn(401, 429);
        }

        assertThat(sawRateLimit).isTrue();
    }
}
