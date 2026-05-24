package com.watchstore.repository;

import com.watchstore.domain.entity.EnquiryReply;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnquiryReplyRepository extends JpaRepository<EnquiryReply, UUID> {

    List<EnquiryReply> findByEnquiry_IdOrderByCreatedAtAsc(UUID enquiryId);
}
