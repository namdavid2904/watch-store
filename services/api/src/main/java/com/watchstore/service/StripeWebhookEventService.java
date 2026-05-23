package com.watchstore.service;

import com.watchstore.domain.entity.StripeWebhookEvent;
import com.watchstore.repository.StripeWebhookEventRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StripeWebhookEventService {

    private final StripeWebhookEventRepository stripeWebhookEventRepository;

    @Transactional
    public void processOnce(String eventId, String eventType, Runnable handler) {
        if (stripeWebhookEventRepository.existsById(eventId)) {
            return;
        }

        StripeWebhookEvent event = new StripeWebhookEvent();
        event.setEventId(eventId);
        event.setEventType(eventType);
        event.setProcessedAt(Instant.now());

        try {
            stripeWebhookEventRepository.saveAndFlush(event);
        } catch (DataIntegrityViolationException exception) {
            return;
        }

        handler.run();
    }
}
