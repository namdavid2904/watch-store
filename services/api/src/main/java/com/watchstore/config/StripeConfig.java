package com.watchstore.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(StripeProperties.class)
public class StripeConfig {

    private final StripeProperties stripeProperties;

    public StripeConfig(StripeProperties stripeProperties) {
        this.stripeProperties = stripeProperties;
    }

    @PostConstruct
    void initializeStripeClient() {
        if (!stripeProperties.isEnabled()) {
            return;
        }
        if (!StringUtils.hasText(stripeProperties.getSecretKey())) {
            throw new IllegalStateException("app.stripe.secret-key is required when Stripe is enabled");
        }
        Stripe.apiKey = stripeProperties.getSecretKey();
    }
}
