package com.watchstore.repository;

import com.watchstore.domain.entity.UserWishlist;
import com.watchstore.domain.entity.UserWishlistId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserWishlistRepository extends JpaRepository<UserWishlist, UserWishlistId> {

    List<UserWishlist> findByIdUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByIdUserIdAndIdProductId(UUID userId, UUID productId);

    void deleteByIdUserIdAndIdProductId(UUID userId, UUID productId);
}
