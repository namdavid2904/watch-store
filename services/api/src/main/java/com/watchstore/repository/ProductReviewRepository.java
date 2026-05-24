package com.watchstore.repository;

import com.watchstore.domain.entity.ProductReview;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, UUID> {

    Page<ProductReview> findByProduct_IdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    Optional<ProductReview> findByProduct_IdAndUser_Id(UUID productId, UUID userId);

    @Query("""
            SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END
            FROM Order o
            JOIN o.orderItems oi
            WHERE o.user.id = :userId
              AND oi.product.id = :productId
              AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
            """)
    boolean hasVerifiedPurchase(@Param("userId") UUID userId, @Param("productId") UUID productId);

    @Query("""
            SELECT o.id FROM Order o
            JOIN o.orderItems oi
            WHERE o.user.id = :userId
              AND oi.product.id = :productId
              AND o.status IN ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED')
            ORDER BY o.createdAt DESC
            """)
    List<UUID> findVerifiedOrderIds(
            @Param("userId") UUID userId,
            @Param("productId") UUID productId,
            Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId")
    Double averageRatingByProductId(@Param("productId") UUID productId);
}
