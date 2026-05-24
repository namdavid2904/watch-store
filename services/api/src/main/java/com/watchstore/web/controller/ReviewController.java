package com.watchstore.web.controller;

import com.watchstore.security.SecurityUtils;
import com.watchstore.service.ReviewService;
import com.watchstore.web.dto.CreateReviewRequest;
import com.watchstore.web.dto.ReviewPageResponse;
import com.watchstore.web.dto.ReviewResponse;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products/{slug}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ReviewPageResponse> listReviews(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.listByProductSlug(slug, page, size));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable String slug,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(slug, SecurityUtils.requireCurrentUserId(), request));
    }

    @GetMapping("/eligibility")
    public ResponseEntity<Map<String, Boolean>> checkEligibility(@PathVariable String slug) {
        boolean canReview = SecurityUtils.getCurrentUser()
                .map(user -> reviewService.canUserReview(user.getId(), slug))
                .orElse(false);
        return ResponseEntity.ok(Map.of("canReview", canReview));
    }
}
