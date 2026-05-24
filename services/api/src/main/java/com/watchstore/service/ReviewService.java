package com.watchstore.service;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.entity.Product;
import com.watchstore.domain.entity.ProductReview;
import com.watchstore.domain.entity.User;
import com.watchstore.exception.ApiException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.OrderRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.repository.ProductReviewRepository;
import com.watchstore.repository.UserRepository;
import com.watchstore.web.dto.CreateReviewRequest;
import com.watchstore.web.dto.ReviewPageResponse;
import com.watchstore.web.dto.ReviewResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public ReviewPageResponse listByProductSlug(String slug, int page, int size) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Page<ProductReview> reviews = reviewRepository.findByProduct_IdOrderByCreatedAtDesc(
                product.getId(), PageRequest.of(page, size));

        double averageRating = reviewRepository.averageRatingByProductId(product.getId()) != null
                ? reviewRepository.averageRatingByProductId(product.getId())
                : 0.0;

        List<ReviewResponse> content = reviews.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new ReviewPageResponse(
                content,
                reviews.getNumber(),
                reviews.getSize(),
                reviews.getTotalElements(),
                reviews.getTotalPages(),
                averageRating
        );
    }

    @Transactional
    public ReviewResponse create(String slug, UUID userId, CreateReviewRequest request) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.findByProduct_IdAndUser_Id(product.getId(), userId).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already reviewed this product");
        }

        if (!reviewRepository.hasVerifiedPurchase(userId, product.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only verified purchasers can leave a review");
        }

        UUID orderId = reviewRepository.findVerifiedOrderIds(userId, product.getId(), PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Verified order not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setOrder(order);
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setBody(request.body());
        review.setWristSizeMm(request.wristSizeMm());
        review.setCaseFit(request.caseFit());

        return toResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public boolean canUserReview(UUID userId, String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (reviewRepository.findByProduct_IdAndUser_Id(product.getId(), userId).isPresent()) {
            return false;
        }

        return reviewRepository.hasVerifiedPurchase(userId, product.getId());
    }

    private ReviewResponse toResponse(ProductReview review) {
        String reviewerName = buildReviewerName(review.getUser());
        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getId(),
                reviewerName,
                review.getRating(),
                review.getTitle(),
                review.getBody(),
                review.getWristSizeMm(),
                review.getCaseFit(),
                true,
                review.getCreatedAt()
        );
    }

    private String buildReviewerName(User user) {
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last = user.getLastName() != null ? user.getLastName().trim() : "";
        if (!first.isEmpty() && !last.isEmpty()) {
            return first + " " + last.charAt(0) + ".";
        }
        if (!first.isEmpty()) {
            return first;
        }
        return user.getEmail().split("@")[0];
    }
}
