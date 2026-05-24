package com.watchstore.infrastructure.email;

public interface EmailGateway {

    void send(EmailMessage message);
}
