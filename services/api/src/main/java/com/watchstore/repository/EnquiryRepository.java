package com.watchstore.repository;

import com.watchstore.domain.entity.Enquiry;
import com.watchstore.domain.enums.EnquiryStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EnquiryRepository extends JpaRepository<Enquiry, UUID> {

    List<Enquiry> findByStatusOrderByCreatedAtDesc(EnquiryStatus status);

    List<Enquiry> findByCategoryOrderByCreatedAtDesc(String category);

    @Query("SELECT e FROM Enquiry e LEFT JOIN FETCH e.product WHERE e.id = :id")
    Optional<Enquiry> findByIdWithProduct(@Param("id") UUID id);
}
