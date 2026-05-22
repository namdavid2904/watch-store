package com.watchstore.config;

import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

@Configuration
public class S3Config {

    @Value("${app.s3.endpoint:}")
    private String endpoint;

    @Value("${app.s3.region}")
    private String region;

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String secretAccessKey;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder().region(Region.of(region));

        if (usesCustomEndpoint(endpoint)) {
            builder.endpointOverride(URI.create(endpoint.trim())).forcePathStyle(true);
            builder.credentialsProvider(resolveLocalstackCredentials());
        } else if (hasExplicitCredentials()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKeyId.trim(), secretAccessKey.trim())));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }

    private boolean usesCustomEndpoint(String configuredEndpoint) {
        if (!StringUtils.hasText(configuredEndpoint)) {
            return false;
        }
        String normalized = configuredEndpoint.trim().toLowerCase();
        return !normalized.contains("amazonaws.com");
    }

    private boolean hasExplicitCredentials() {
        return StringUtils.hasText(accessKeyId) && StringUtils.hasText(secretAccessKey);
    }

    private StaticCredentialsProvider resolveLocalstackCredentials() {
        if (hasExplicitCredentials()) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKeyId.trim(), secretAccessKey.trim()));
        }
        return StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test"));
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
