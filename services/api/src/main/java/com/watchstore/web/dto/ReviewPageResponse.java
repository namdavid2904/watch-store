package com.watchstore.web.dto;

import java.util.List;

public record ReviewPageResponse(
        List<ReviewResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        double averageRating
) {
}
