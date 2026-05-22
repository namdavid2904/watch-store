package com.watchstore.service;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservationCleanupScheduler {

    private final InventoryService inventoryService;

    @Scheduled(fixedRate = 60_000)
    public void releaseExpiredReservations() {
        List<String> expiredCheckoutIds = inventoryService.findExpiredReservationKeys();
        for (String checkoutIdStr : expiredCheckoutIds) {
            try {
                UUID checkoutId = UUID.fromString(checkoutIdStr);
                inventoryService.releaseReservation(checkoutId);
                log.debug("Released expired reservation for checkout {}", checkoutId);
            } catch (Exception e) {
                log.warn("Failed to release reservation for checkout {}: {}", checkoutIdStr, e.getMessage());
            }
        }
    }
}
