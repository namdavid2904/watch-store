package com.watchstore.web.dto;

public record CacheStatsResponse(
        long hits,
        long misses,
        double hitRatio
) {
}
