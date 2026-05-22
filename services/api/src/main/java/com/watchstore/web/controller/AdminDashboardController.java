package com.watchstore.web.controller;

import com.watchstore.service.AdminAnalyticsService;
import com.watchstore.web.dto.DashboardStatsResponse;
import com.watchstore.web.dto.SalesChartPoint;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(adminAnalyticsService.getDashboardStats());
    }

    @GetMapping("/sales-chart")
    public ResponseEntity<List<SalesChartPoint>> getSalesChart(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminAnalyticsService.getSalesChart(days));
    }
}
