package com.watchstore.service;

import com.watchstore.domain.entity.Product;
import com.watchstore.domain.entity.User;
import com.watchstore.domain.entity.UserWishlist;
import com.watchstore.domain.entity.UserWishlistId;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.ProductRepository;
import com.watchstore.repository.UserRepository;
import com.watchstore.repository.UserWishlistRepository;
import com.watchstore.web.dto.ProductResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final UserWishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<ProductResponse> listWishlist(UUID userId) {
        return wishlistRepository.findByIdUserIdOrderByCreatedAtDesc(userId).stream()
                .map(UserWishlist::getProduct)
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional
    public void addToWishlist(UUID userId, UUID productId) {
        if (wishlistRepository.existsByIdUserIdAndIdProductId(userId, productId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Product already in wishlist");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        UserWishlist wishlist = new UserWishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        UserWishlistId id = new UserWishlistId();
        id.setUserId(userId);
        id.setProductId(productId);
        wishlist.setId(id);
        wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        if (!wishlistRepository.existsByIdUserIdAndIdProductId(userId, productId)) {
            throw new ResourceNotFoundException("Wishlist item not found");
        }
        wishlistRepository.deleteByIdUserIdAndIdProductId(userId, productId);
    }
}
