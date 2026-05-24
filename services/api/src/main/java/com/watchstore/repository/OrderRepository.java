package com.watchstore.repository;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.enums.OrderStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<Order> findByStatus(OrderStatus status);

    Optional<Order> findByPaymentIntentId(String paymentIntentId);

    @Query("""
            SELECT DISTINCT o FROM Order o
            JOIN FETCH o.user
            LEFT JOIN FETCH o.orderItems oi
            LEFT JOIN FETCH oi.product
            WHERE o.id = :id
            """)
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);
}
