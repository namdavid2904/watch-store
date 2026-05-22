package com.watchstore.web.controller;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.service.EnquiryService;
import com.watchstore.web.dto.EnquiryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryService enquiryService;

    @PostMapping
    public ResponseEntity<Enquiry> create(@Valid @RequestBody EnquiryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enquiryService.create(request));
    }
}
