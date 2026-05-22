package com.watchstore.service;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.enums.EnquiryStatus;
import com.watchstore.domain.enums.OrderStatus;
import com.watchstore.repository.EnquiryRepository;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.repository.OrderRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.DashboardStatsResponse;
import com.watchstore.web.dto.SalesChartPoint;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final EnquiryRepository enquiryRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        long totalOrders = orders.size();
        long pendingOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING_PAYMENT || o.getStatus() == OrderStatus.PROCESSING)
                .count();
        long totalProducts = productRepository.count();
        long lowStockProducts = inventoryRepository.findAll().stream()
                .filter(i -> i.getQuantityAvailable() <= LOW_STOCK_THRESHOLD)
                .count();
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.FAILED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long newEnquiries = enquiryRepository.findByStatusOrderByCreatedAtDesc(EnquiryStatus.NEW).size();

        return new DashboardStatsResponse(totalOrders, pendingOrders, totalProducts, lowStockProducts, totalRevenue, newEnquiries);
    }

    @Transactional(readOnly = true)
    public List<SalesChartPoint> getSalesChart(int days) {
        Instant since = Instant.now().minusSeconds((long) days * 86400);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(since))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.FAILED)
                .toList();

        Map<LocalDate, List<Order>> byDate = orders.stream()
                .collect(Collectors.groupingBy(o -> LocalDate.ofInstant(o.getCreatedAt(), ZoneOffset.UTC)));

        List<SalesChartPoint> points = new ArrayList<>();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            List<Order> dayOrders = byDate.getOrDefault(date, List.of());
            BigDecimal revenue = dayOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            points.add(new SalesChartPoint(date, dayOrders.size(), revenue));
        }

        points.sort(Comparator.comparing(SalesChartPoint::date));
        return points;
    }
}
