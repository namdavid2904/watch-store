package com.watchstore.web.controller;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.enums.EnquiryStatus;
import com.watchstore.security.SecurityUtils;
import com.watchstore.service.EnquiryService;
import com.watchstore.web.dto.AddEnquiryReplyRequest;
import com.watchstore.web.dto.AddEnquiryTagRequest;
import com.watchstore.web.dto.EnquiryDetailResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
            @RequestParam(required = false) EnquiryStatus status,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(enquiryService.listFiltered(status, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnquiryDetailResponse> getEnquiry(@PathVariable UUID id) {
        return ResponseEntity.ok(enquiryService.getDetail(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Enquiry> updateStatus(@PathVariable UUID id,
                                                @RequestBody EnquiryStatus status) {
        return ResponseEntity.ok(enquiryService.updateStatus(id, status));
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<EnquiryDetailResponse> addReply(
            @PathVariable UUID id,
            @Valid @RequestBody AddEnquiryReplyRequest request) {
        enquiryService.addReply(id, SecurityUtils.requireCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(enquiryService.getDetail(id));
    }

    @PostMapping("/{id}/tags")
    public ResponseEntity<List<String>> addTag(
            @PathVariable UUID id,
            @Valid @RequestBody AddEnquiryTagRequest request) {
        return ResponseEntity.ok(enquiryService.addTag(id, request.tag()));
    }

    @DeleteMapping("/{id}/tags/{tag}")
    public ResponseEntity<List<String>> removeTag(@PathVariable UUID id, @PathVariable String tag) {
        return ResponseEntity.ok(enquiryService.removeTag(id, tag));
    }
}
