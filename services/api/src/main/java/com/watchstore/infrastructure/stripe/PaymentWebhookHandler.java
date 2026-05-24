package com.watchstore.infrastructure.stripe;

import com.watchstore.domain.enums.OrderStatus;
import com.watchstore.domain.event.OrderPaidEvent;
import com.watchstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class PaymentWebhookHandler {

    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void markOrderPaid(String paymentIntentId) {
        orderRepository.findByPaymentIntentId(paymentIntentId)
                .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                .ifPresent(order -> {
                    order.setStatus(OrderStatus.PAID);
                    eventPublisher.publishEvent(new OrderPaidEvent(order.getId()));
                });
    }

    @Transactional
    public void markOrderFailed(String paymentIntentId) {
        orderRepository.findByPaymentIntentId(paymentIntentId)
                .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                .ifPresent(order -> order.setStatus(OrderStatus.FAILED));
    }
}
