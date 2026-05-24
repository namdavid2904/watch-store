package com.watchstore.service;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.entity.Product;
import com.watchstore.domain.enums.EnquiryStatus;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.EnquiryRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.web.dto.EnquiryRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Enquiry create(EnquiryRequest request) {
        Enquiry enquiry = new Enquiry();
        enquiry.setName(request.name());
        enquiry.setEmail(request.email());
        enquiry.setMobile(request.mobile());
        enquiry.setMessage(request.message());
        enquiry.setSubject(request.subject());
        enquiry.setCategory(request.category());
        enquiry.setStatus(EnquiryStatus.NEW);

        if (request.productId() != null) {
            Product product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            enquiry.setProduct(product);
        }

        return enquiryRepository.save(enquiry);
    }

    @Transactional(readOnly = true)
    public List<Enquiry> listAll() {
        return enquiryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Enquiry> listByStatus(EnquiryStatus status) {
        return enquiryRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional
    public Enquiry updateStatus(UUID id, EnquiryStatus status) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));
        enquiry.setStatus(status);
        return enquiry;
    }
}
