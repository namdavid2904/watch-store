package com.watchstore.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ObservabilityConfig {

    @Bean
    public Counter ordersCreatedTotal(MeterRegistry registry) {
        return Counter.builder("orders.created.total")
                .description("Total number of orders created")
                .register(registry);
    }

    @Bean
    public Counter checkoutFailuresTotal(MeterRegistry registry) {
        return Counter.builder("checkout.failures.total")
                .description("Total number of checkout failures")
                .register(registry);
    }

    @Bean
    public Counter inventoryConflictsTotal(MeterRegistry registry) {
        return Counter.builder("inventory.conflicts.total")
                .description("Total number of inventory conflicts")
                .register(registry);
    }

    @Bean
    public Counter catalogCacheHits(MeterRegistry registry) {
        return Counter.builder("catalog.cache.hits")
                .description("Catalog cache hits")
                .register(registry);
    }

    @Bean
    public Counter catalogCacheMisses(MeterRegistry registry) {
        return Counter.builder("catalog.cache.misses")
                .description("Catalog cache misses")
                .register(registry);
    }
}
