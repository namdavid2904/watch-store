package com.watchstore.infrastructure.email;

import com.watchstore.config.EmailProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
@RequiredArgsConstructor
public class SesEmailGateway implements EmailGateway {

    private final SesV2Client sesV2Client;
    private final EmailProperties emailProperties;

    @Override
    public void send(EmailMessage message) {
        String fromAddress = emailProperties.getFromAddress();
        if (!StringUtils.hasText(fromAddress)) {
            throw new IllegalStateException("app.mail.from-address is required when email is enabled");
        }

        SendEmailRequest request = SendEmailRequest.builder()
                .fromEmailAddress(fromAddress)
                .destination(Destination.builder()
                        .toAddresses(message.to())
                        .build())
                .content(EmailContent.builder()
                        .simple(Message.builder()
                                .subject(Content.builder()
                                        .data(message.subject())
                                        .charset("UTF-8")
                                        .build())
                                .body(Body.builder()
                                        .html(Content.builder()
                                                .data(message.htmlBody())
                                                .charset("UTF-8")
                                                .build())
                                        .build())
                                .build())
                        .build())
                .build();

        sesV2Client.sendEmail(request);
    }
}
