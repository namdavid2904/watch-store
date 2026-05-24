package com.watchstore.service;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.entity.EnquiryReply;
import com.watchstore.domain.entity.EnquiryTag;
import com.watchstore.domain.entity.Product;
import com.watchstore.domain.entity.User;
import com.watchstore.domain.enums.EnquiryStatus;
import com.watchstore.exception.ResourceNotFoundException;
import com.watchstore.repository.EnquiryReplyRepository;
import com.watchstore.repository.EnquiryRepository;
import com.watchstore.repository.EnquiryTagRepository;
import com.watchstore.repository.ProductRepository;
import com.watchstore.repository.UserRepository;
import com.watchstore.web.dto.AddEnquiryReplyRequest;
import com.watchstore.web.dto.EnquiryDetailResponse;
import com.watchstore.web.dto.EnquiryReplyResponse;
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
    private final EnquiryTagRepository enquiryTagRepository;
    private final EnquiryReplyRepository enquiryReplyRepository;
    private final UserRepository userRepository;

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
    public List<Enquiry> listFiltered(EnquiryStatus status, String category) {
        if (status != null) {
            return enquiryRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        if (category != null && !category.isBlank()) {
            return enquiryRepository.findByCategoryOrderByCreatedAtDesc(category);
        }
        return enquiryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public EnquiryDetailResponse getDetail(UUID id) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));

        List<String> tags = enquiryTagRepository.findByEnquiryId(id).stream()
                .map(EnquiryTag::getTag)
                .toList();

        List<EnquiryReplyResponse> replies = enquiryReplyRepository.findByEnquiry_IdOrderByCreatedAtAsc(id).stream()
                .map(this::toReplyResponse)
                .toList();

        return new EnquiryDetailResponse(
                enquiry.getId(),
                enquiry.getName(),
                enquiry.getEmail(),
                enquiry.getMobile(),
                enquiry.getMessage(),
                enquiry.getStatus(),
                enquiry.getProduct() != null ? enquiry.getProduct().getId() : null,
                enquiry.getSubject(),
                enquiry.getCategory(),
                tags,
                replies,
                enquiry.getCreatedAt()
        );
    }

    @Transactional
    public EnquiryReplyResponse addReply(UUID enquiryId, UUID adminUserId, AddEnquiryReplyRequest request) {
        Enquiry enquiry = enquiryRepository.findById(enquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        EnquiryReply reply = new EnquiryReply();
        reply.setEnquiry(enquiry);
        reply.setAdminUser(admin);
        reply.setBody(request.body());

        return toReplyResponse(enquiryReplyRepository.save(reply));
    }

    @Transactional
    public List<String> addTag(UUID enquiryId, String tag) {
        if (!enquiryRepository.existsById(enquiryId)) {
            throw new ResourceNotFoundException("Enquiry not found");
        }

        EnquiryTag enquiryTag = new EnquiryTag();
        enquiryTag.setEnquiryId(enquiryId);
        enquiryTag.setTag(tag.trim());
        enquiryTagRepository.save(enquiryTag);

        return enquiryTagRepository.findByEnquiryId(enquiryId).stream()
                .map(EnquiryTag::getTag)
                .toList();
    }

    @Transactional
    public List<String> removeTag(UUID enquiryId, String tag) {
        enquiryTagRepository.deleteByEnquiryIdAndTag(enquiryId, tag);
        return enquiryTagRepository.findByEnquiryId(enquiryId).stream()
                .map(EnquiryTag::getTag)
                .toList();
    }

    private EnquiryReplyResponse toReplyResponse(EnquiryReply reply) {
        User admin = reply.getAdminUser();
        String adminName = admin.getFirstName() != null ? admin.getFirstName() : admin.getEmail();
        return new EnquiryReplyResponse(
                reply.getId(),
                admin.getId(),
                adminName,
                reply.getBody(),
                reply.getCreatedAt()
        );
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
