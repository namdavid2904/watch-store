package com.watchstore.web.controller;

import com.watchstore.security.SecurityUtils;
import com.watchstore.service.AuthService;
import com.watchstore.service.WishlistService;
import com.watchstore.web.dto.PatchProfileRequest;
import com.watchstore.web.dto.ProductResponse;
import com.watchstore.web.dto.UpdateProfileRequest;
import com.watchstore.web.dto.UserProfileResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountController {

    private final AuthService authService;
    private final WishlistService wishlistService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile() {
        return ResponseEntity.ok(authService.getProfile(SecurityUtils.requireCurrentUserId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(
                SecurityUtils.requireCurrentUserId(),
                request.firstName(),
                request.lastName()));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> patchProfile(@Valid @RequestBody PatchProfileRequest request) {
        return ResponseEntity.ok(authService.patchProfile(SecurityUtils.requireCurrentUserId(), request));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<ProductResponse>> getWishlist() {
        return ResponseEntity.ok(wishlistService.listWishlist(SecurityUtils.requireCurrentUserId()));
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<Void> addToWishlist(@PathVariable UUID productId) {
        wishlistService.addToWishlist(SecurityUtils.requireCurrentUserId(), productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable UUID productId) {
        wishlistService.removeFromWishlist(SecurityUtils.requireCurrentUserId(), productId);
        return ResponseEntity.noContent().build();
    }
}
