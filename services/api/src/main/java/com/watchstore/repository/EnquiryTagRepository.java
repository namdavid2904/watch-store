package com.watchstore.repository;

import com.watchstore.domain.entity.EnquiryTag;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnquiryTagRepository extends JpaRepository<EnquiryTag, EnquiryTag.EnquiryTagId> {

    List<EnquiryTag> findByEnquiryId(UUID enquiryId);

    void deleteByEnquiryIdAndTag(UUID enquiryId, String tag);
}
