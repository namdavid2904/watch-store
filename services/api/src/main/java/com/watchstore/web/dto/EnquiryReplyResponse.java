package com.watchstore.web.dto;

import java.time.Instant;
import java.util.UUID;

public record EnquiryReplyResponse(
        UUID id,
        UUID adminUserId,
        String adminName,
        String body,
        Instant createdAt
) {
}
