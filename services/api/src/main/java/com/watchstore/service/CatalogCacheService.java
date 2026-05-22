package com.watchstore.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchstore.web.dto.PageResponse;
import com.watchstore.web.dto.ProductFilterRequest;
import com.watchstore.web.dto.ProductResponse;
import io.micrometer.core.instrument.Counter;
import java.time.Duration;
import java.util.Set;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CatalogCacheService {

    private static final String CACHE_PREFIX = "catalog:";
    private static final Duration TTL = Duration.ofSeconds(60);

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;
    private final Counter catalogCacheHits;
    private final Counter catalogCacheMisses;

    @SuppressWarnings("unchecked")
    public PageResponse<ProductResponse> getOrCompute(ProductFilterRequest filter,
                                                        Supplier<PageResponse<ProductResponse>> supplier) {
        String cacheKey = CACHE_PREFIX + cacheKeyFromFilter(filter);
        String cached = stringRedisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            catalogCacheHits.increment();
            try {
                return objectMapper.readValue(cached,
                        objectMapper.getTypeFactory().constructParametricType(PageResponse.class, ProductResponse.class));
            } catch (JsonProcessingException e) {
                stringRedisTemplate.delete(cacheKey);
            }
        }

        catalogCacheMisses.increment();
        PageResponse<ProductResponse> result = supplier.get();
        try {
            stringRedisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(result), TTL);
        } catch (JsonProcessingException ignored) {
            // skip cache write on serialization failure
        }
        return result;
    }

    public void invalidateAll() {
        Set<String> keys = stringRedisTemplate.keys(CACHE_PREFIX + "*");
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }

    private String cacheKeyFromFilter(ProductFilterRequest filter) {
        return String.join(":",
                String.valueOf(filter.movementType()),
                String.valueOf(filter.brandId()),
                String.valueOf(filter.categoryId()),
                String.valueOf(filter.minPrice()),
                String.valueOf(filter.maxPrice()),
                String.valueOf(filter.caseMaterial()),
                String.valueOf(filter.color()),
                String.valueOf(filter.search()),
                String.valueOf(filter.page()),
                String.valueOf(filter.size()),
                filter.sort()
        ).hashCode() + "";
    }
}
