package com.watchstore.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.UUID;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "enquiry_tags")
@IdClass(EnquiryTag.EnquiryTagId.class)
@Getter
@Setter
@NoArgsConstructor
public class EnquiryTag {

    @Id
    @Column(name = "enquiry_id")
    private UUID enquiryId;

    @Id
    @Column(length = 50)
    private String tag;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "enquiry_id", insertable = false, updatable = false)
    private Enquiry enquiry;

    @EqualsAndHashCode
    @NoArgsConstructor
    public static class EnquiryTagId implements Serializable {
        private UUID enquiryId;
        private String tag;
    }
}
