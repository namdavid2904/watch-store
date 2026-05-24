package com.watchstore.web.controller;

import com.watchstore.service.AdminTelemetryService;
import com.watchstore.web.dto.BrandTurnoverItem;
import com.watchstore.web.dto.CacheStatsResponse;
import com.watchstore.web.dto.CheckoutErrorMetric;
import com.watchstore.web.dto.InventoryHealthItem;
import com.watchstore.web.dto.TelemetrySummaryResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/telemetry")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTelemetryController {

    private final AdminTelemetryService adminTelemetryService;

    @GetMapping("/summary")
    public ResponseEntity<TelemetrySummaryResponse> getSummary() {
        return ResponseEntity.ok(adminTelemetryService.getSummary());
    }

    @GetMapping("/checkout-errors")
    public ResponseEntity<List<CheckoutErrorMetric>> getCheckoutErrors() {
        return ResponseEntity.ok(adminTelemetryService.getCheckoutErrors());
    }

    @GetMapping("/cache-stats")
    public ResponseEntity<CacheStatsResponse> getCacheStats() {
        return ResponseEntity.ok(adminTelemetryService.getCacheStats());
    }

    @GetMapping("/inventory-health")
    public ResponseEntity<List<InventoryHealthItem>> getInventoryHealth() {
        return ResponseEntity.ok(adminTelemetryService.getInventoryHealth());
    }

    @GetMapping("/brand-turnover")
    public ResponseEntity<List<BrandTurnoverItem>> getBrandTurnover(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminTelemetryService.getBrandTurnover(days));
    }
}
