package com.watchstore.web.controller;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.enums.EnquiryStatus;
import com.watchstore.service.EnquiryService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/enquiries")
@RequiredArgsConstructor
public class AdminEnquiryController {

    private final EnquiryService enquiryService;

    @GetMapping
    public ResponseEntity<List<Enquiry>> listEnquiries(
            @RequestParam(required = false) EnquiryStatus status) {
        if (status != null) {
            return ResponseEntity.ok(enquiryService.listByStatus(status));
        }
        return ResponseEntity.ok(enquiryService.listAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Enquiry> updateStatus(@PathVariable UUID id,
                                                @RequestBody EnquiryStatus status) {
        return ResponseEntity.ok(enquiryService.updateStatus(id, status));
    }
}
