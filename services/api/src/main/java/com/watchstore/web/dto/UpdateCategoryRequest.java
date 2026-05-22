package com.watchstore.web.dto;

public record UpdateCategoryRequest(
        String name,
        String slug
) {
}
