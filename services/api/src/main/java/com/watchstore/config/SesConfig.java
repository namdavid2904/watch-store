package com.watchstore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.SesV2ClientBuilder;

@Configuration
@EnableConfigurationProperties(EmailProperties.class)
public class SesConfig {

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String accessKeyId;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String secretAccessKey;

    @Bean
    public SesV2Client sesV2Client(EmailProperties emailProperties) {
        SesV2ClientBuilder builder = SesV2Client.builder()
                .region(Region.of(emailProperties.getRegion()));

        if (hasExplicitCredentials()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKeyId.trim(), secretAccessKey.trim())));
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }

    private boolean hasExplicitCredentials() {
        return StringUtils.hasText(accessKeyId) && StringUtils.hasText(secretAccessKey);
    }
}
