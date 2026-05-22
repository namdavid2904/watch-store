package com.watchstore.repository;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.enums.OrderStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<Order> findByStatus(OrderStatus status);

    Optional<Order> findByPaymentIntentId(String paymentIntentId);
}
