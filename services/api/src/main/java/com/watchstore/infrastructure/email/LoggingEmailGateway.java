package com.watchstore.infrastructure.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "false", matchIfMissing = true)
public class LoggingEmailGateway implements EmailGateway {

    @Override
    public void send(EmailMessage message) {
        log.info(
                "Email stub — to: {}, subject: {}, html length: {}",
                message.to(),
                message.subject(),
                message.htmlBody() != null ? message.htmlBody().length() : 0);
        if (log.isDebugEnabled() && message.htmlBody() != null) {
            log.debug("Email HTML body:\n{}", message.htmlBody());
        }
    }
}
