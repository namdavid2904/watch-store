package com.watchstore.service;

import com.watchstore.domain.entity.Inventory;
import com.watchstore.exception.InsufficientStockException;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.web.dto.AdjustInventoryRequest;
import com.watchstore.web.dto.InventoryResponse;
import io.micrometer.core.instrument.Counter;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final String RESERVATION_PREFIX = "reservation:";
    private static final Duration RESERVATION_TTL = Duration.ofMinutes(15);

    private final InventoryRepository inventoryRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private final Counter inventoryConflictsTotal;

    @Transactional(readOnly = true)
    public InventoryResponse getInventory(UUID productId) {
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
        return toResponse(inventory);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> listAll() {
        return inventoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InventoryResponse adjustStock(UUID productId, AdjustInventoryRequest request) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));

        int newAvailable = inventory.getQuantityAvailable() + request.delta();
        if (newAvailable < 0) {
            throw new InsufficientStockException("Cannot reduce stock below zero");
        }
        inventory.setQuantityAvailable(newAvailable);
        return toResponse(inventory);
    }

    @Transactional
    public void reserveStock(UUID checkoutId, Map<UUID, Integer> items) {
        for (Map.Entry<UUID, Integer> entry : items.entrySet()) {
            reserveProductStock(checkoutId, entry.getKey(), entry.getValue());
        }
        storeReservationMeta(checkoutId, items);
    }

    @Transactional
    public void confirmReservation(UUID checkoutId) {
        Map<UUID, Integer> items = loadReservationMeta(checkoutId);
        if (items.isEmpty()) {
            return;
        }
        for (Map.Entry<UUID, Integer> entry : items.entrySet()) {
            Inventory inventory = inventoryRepository.findByProductIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
            int qty = entry.getValue();
            if (inventory.getQuantityReserved() < qty) {
                inventoryConflictsTotal.increment();
                throw new InsufficientStockException("Reservation expired or invalid for product " + entry.getKey());
            }
            inventory.setQuantityReserved(inventory.getQuantityReserved() - qty);
        }
        clearReservation(checkoutId);
    }

    @Transactional
    public void releaseReservation(UUID checkoutId) {
        Map<UUID, Integer> items = loadReservationMeta(checkoutId);
        for (Map.Entry<UUID, Integer> entry : items.entrySet()) {
            inventoryRepository.findByProductIdForUpdate(entry.getKey()).ifPresent(inventory -> {
                inventory.setQuantityReserved(Math.max(0, inventory.getQuantityReserved() - entry.getValue()));
            });
        }
        clearReservation(checkoutId);
    }

    private void reserveProductStock(UUID checkoutId, UUID productId, int quantity) {
        try {
            Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product " + productId));

            if (inventory.getQuantityAvailable() < quantity) {
                inventoryConflictsTotal.increment();
                throw new InsufficientStockException("Insufficient stock for product " + productId);
            }
            inventory.setQuantityAvailable(inventory.getQuantityAvailable() - quantity);
            inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        } catch (OptimisticLockingFailureException e) {
            inventoryConflictsTotal.increment();
            throw new InsufficientStockException("Inventory conflict for product " + productId);
        }
    }

    private void storeReservationMeta(UUID checkoutId, Map<UUID, Integer> items) {
        String key = RESERVATION_PREFIX + checkoutId;
        items.forEach((productId, qty) ->
                stringRedisTemplate.opsForHash().put(key, productId.toString(), String.valueOf(qty)));
        stringRedisTemplate.expire(key, RESERVATION_TTL);
        stringRedisTemplate.opsForValue().set(key + ":expires", String.valueOf(System.currentTimeMillis() + RESERVATION_TTL.toMillis()), RESERVATION_TTL);
    }

    public Map<UUID, Integer> loadReservationForCheckout(UUID checkoutId) {
        return loadReservationMeta(checkoutId);
    }

    private Map<UUID, Integer> loadReservationMeta(UUID checkoutId) {
        String key = RESERVATION_PREFIX + checkoutId;
        Map<Object, Object> entries = stringRedisTemplate.opsForHash().entries(key);
        return entries.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> UUID.fromString(e.getKey().toString()),
                        e -> Integer.parseInt(e.getValue().toString())
                ));
    }

    private void clearReservation(UUID checkoutId) {
        String key = RESERVATION_PREFIX + checkoutId;
        stringRedisTemplate.delete(key);
        stringRedisTemplate.delete(key + ":expires");
    }

    public void releaseExpiredReservations() {
        // Scan reservation keys and release expired ones handled by scheduler via expires key
    }

    public List<String> findExpiredReservationKeys() {
        Set<String> keys = stringRedisTemplate.keys(RESERVATION_PREFIX + "*:expires");
        if (keys == null) {
            return List.of();
        }
        long now = System.currentTimeMillis();
        return keys.stream()
                .filter(key -> {
                    String expires = stringRedisTemplate.opsForValue().get(key);
                    return expires != null && Long.parseLong(expires) <= now;
                })
                .map(key -> key.replace(":expires", ""))
                .map(key -> key.substring(RESERVATION_PREFIX.length()))
                .toList();
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getProductId(),
                inventory.getProduct().getName(),
                inventory.getQuantityAvailable(),
                inventory.getQuantityReserved(),
                inventory.getQuantityAvailable() + inventory.getQuantityReserved()
        );
    }
}
