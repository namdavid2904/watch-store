package com.watchstore.infrastructure.redis;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RefreshTokenStore {

    private static final String TOKEN_KEY_PREFIX = "refresh:";
    private static final String USER_INDEX_PREFIX = "user-refresh:";

    private final StringRedisTemplate redisTemplate;

    public void store(UUID userId, String tokenHash, long ttlMs) {
        String tokenKey = TOKEN_KEY_PREFIX + tokenHash;
        String userKey = USER_INDEX_PREFIX + userId;

        redisTemplate.opsForValue().set(tokenKey, userId.toString(), Duration.ofMillis(ttlMs));
        redisTemplate.opsForSet().add(userKey, tokenHash);
        redisTemplate.expire(userKey, Duration.ofMillis(ttlMs));
    }

    public boolean exists(String tokenHash) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(TOKEN_KEY_PREFIX + tokenHash));
    }

    public void revoke(String tokenHash) {
        String tokenKey = TOKEN_KEY_PREFIX + tokenHash;
        String userId = redisTemplate.opsForValue().get(tokenKey);
        redisTemplate.delete(tokenKey);
        if (userId != null) {
            redisTemplate.opsForSet().remove(USER_INDEX_PREFIX + userId, tokenHash);
        }
    }

    public void revokeAllForUser(UUID userId) {
        String userKey = USER_INDEX_PREFIX + userId;
        Set<String> tokenHashes = redisTemplate.opsForSet().members(userKey);
        if (tokenHashes != null) {
            tokenHashes.forEach(hash -> redisTemplate.delete(TOKEN_KEY_PREFIX + hash));
        }
        redisTemplate.delete(userKey);
    }
}
