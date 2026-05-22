package com.watchstore.web.controller;

import com.watchstore.service.InventoryService;
import com.watchstore.web.dto.AdjustInventoryRequest;
import com.watchstore.web.dto.InventoryResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
public class AdminInventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> listInventory() {
        return ResponseEntity.ok(inventoryService.listAll());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getInventory(productId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<InventoryResponse> adjustInventory(@PathVariable UUID productId,
                                                             @Valid @RequestBody AdjustInventoryRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(productId, request));
    }
}
