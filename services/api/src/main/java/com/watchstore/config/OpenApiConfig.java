package com.watchstore.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI watchStoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Watch Store API")
                        .description("REST API for the Watch Store e-commerce platform")
                        .version("v1"));
    }
}
