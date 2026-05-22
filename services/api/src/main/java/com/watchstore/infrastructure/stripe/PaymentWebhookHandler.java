package com.watchstore.infrastructure.stripe;

import com.watchstore.domain.enums.OrderStatus;
import com.watchstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class PaymentWebhookHandler {

    private final OrderRepository orderRepository;

    @Transactional
    public void markOrderPaid(String paymentIntentId) {
        orderRepository.findByPaymentIntentId(paymentIntentId)
                .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                .ifPresent(order -> order.setStatus(OrderStatus.PAID));
    }

    @Transactional
    public void markOrderFailed(String paymentIntentId) {
        orderRepository.findByPaymentIntentId(paymentIntentId)
                .filter(order -> order.getStatus() == OrderStatus.PENDING_PAYMENT)
                .ifPresent(order -> order.setStatus(OrderStatus.FAILED));
    }
}
