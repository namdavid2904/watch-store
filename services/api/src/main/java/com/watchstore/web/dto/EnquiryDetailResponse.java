package com.watchstore.web.dto;

import com.watchstore.domain.enums.EnquiryStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EnquiryDetailResponse(
        UUID id,
        String name,
        String email,
        String mobile,
        String message,
        EnquiryStatus status,
        UUID productId,
        String subject,
        String category,
        List<String> tags,
        List<EnquiryReplyResponse> replies,
        Instant createdAt
) {
}
