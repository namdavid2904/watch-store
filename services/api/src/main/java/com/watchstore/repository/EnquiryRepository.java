package com.watchstore.repository;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.enums.EnquiryStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnquiryRepository extends JpaRepository<Enquiry, UUID> {

    List<Enquiry> findByStatusOrderByCreatedAtDesc(EnquiryStatus status);
}
