package com.watchstore.service;

import com.watchstore.domain.entity.Order;
import com.watchstore.domain.entity.OrderItem;
import com.watchstore.domain.enums.OrderStatus;
import com.watchstore.repository.InventoryRepository;
import com.watchstore.repository.OrderRepository;
import com.watchstore.web.dto.BrandTurnoverItem;
import com.watchstore.web.dto.CacheStatsResponse;
import com.watchstore.web.dto.CheckoutErrorMetric;
import com.watchstore.web.dto.InventoryHealthItem;
import com.watchstore.web.dto.TelemetrySummaryResponse;
import io.micrometer.core.instrument.MeterRegistry;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminTelemetryService {

    private final MeterRegistry meterRegistry;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    public TelemetrySummaryResponse getSummary() {
        return new TelemetrySummaryResponse(
                counterValue("orders.created.total"),
                counterValue("checkout.failures.total"),
                counterValue("inventory.conflicts.total"),
                gaugeValue("catalog.cache.hit.ratio"),
                counterValue("stripe_webhook_events_total")
        );
    }

    public List<CheckoutErrorMetric> getCheckoutErrors() {
        return List.of(
                new CheckoutErrorMetric("Checkout failures", counterValue("checkout.failures.total")),
                new CheckoutErrorMetric("Inventory conflicts", counterValue("inventory.conflicts.total"))
        );
    }

    public CacheStatsResponse getCacheStats() {
        long hits = counterValue("catalog.cache.hits");
        long misses = counterValue("catalog.cache.misses");
        double ratio = gaugeValue("catalog.cache.hit.ratio");
        return new CacheStatsResponse(hits, misses, ratio);
    }

    @Transactional(readOnly = true)
    public List<BrandTurnoverItem> getBrandTurnover(int days) {
        Instant since = Instant.now().minusSeconds((long) days * 86400);
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(since))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.FAILED)
                .toList();

        Map<String, List<OrderItem>> byBrand = orders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .collect(Collectors.groupingBy(item -> item.getProduct().getBrand().getName()));

        return byBrand.entrySet().stream()
                .map(entry -> {
                    long units = entry.getValue().stream().mapToLong(OrderItem::getQuantity).sum();
                    BigDecimal revenue = entry.getValue().stream()
                            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new BrandTurnoverItem(entry.getKey(), units, revenue);
                })
                .sorted(Comparator.comparingLong(BrandTurnoverItem::unitsSold).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryHealthItem> getInventoryHealth() {
        Instant since = Instant.now().minusSeconds(7L * 86400);
        Map<java.util.UUID, Long> soldLast7Days = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(since))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.FAILED)
                .flatMap(o -> o.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getProduct().getId(),
                        Collectors.summingLong(OrderItem::getQuantity)
                ));

        return inventoryRepository.findAll().stream()
                .map(inventory -> {
                    long sold = soldLast7Days.getOrDefault(inventory.getProduct().getId(), 0L);
                    int daysUntilStockout = sold > 0
                            ? (int) Math.ceil(inventory.getQuantityAvailable() / (sold / 7.0))
                            : inventory.getQuantityAvailable() == 0 ? 0 : 999;
                    return new InventoryHealthItem(
                            inventory.getProduct().getId(),
                            inventory.getProduct().getName(),
                            inventory.getProduct().getBrand().getName(),
                            inventory.getQuantityAvailable(),
                            sold,
                            daysUntilStockout
                    );
                })
                .sorted(Comparator.comparingInt(InventoryHealthItem::quantityAvailable))
                .limit(20)
                .toList();
    }

    private long counterValue(String name) {
        var counter = meterRegistry.find(name).counter();
        return counter != null ? (long) counter.count() : 0L;
    }

    private double gaugeValue(String name) {
        var gauge = meterRegistry.find(name).gauge();
        return gauge != null ? gauge.value() : 0.0;
    }
}
