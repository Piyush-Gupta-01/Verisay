package com.backened.verisay.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "agreements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_type", nullable = false)
    private AgreementType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_status", nullable = false)
    private AgreementStatus status;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    // --- THIS IS A CRUCIAL ADDITION ---
    // This field will store the key-value pairs from the forms.
    // e.g., {"landlordName": "John Doe", "rentAmount": "15000"}
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "agreement_data", columnDefinition = "json")
    private Map<String, Object> agreementData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    // --- RELATIONSHIPS ---
    // These link to other tables. Using @JsonIgnore is a good practice to avoid serialization loops.
    // However, for clean DTOs, we often handle this at the DTO level. Keeping it for safety.

    @OneToMany(mappedBy = "agreement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<AudioRecord> audioRecords;

    @OneToMany(mappedBy = "agreement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<IdProof> idProofs;

    @OneToMany(mappedBy = "agreement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<FaceIdentity> faceIdentities;

    // --- ENUMS ---
    // These match the frontend's AGREEMENT_TYPE_MAPPING
    public enum AgreementType {
        RENTAL,
        BUSINESS,
        LOAN,
        FREELANCING
    }

    // Simplified status to match the core flow
    public enum AgreementStatus {
        IN_PROGRESS, // Agreement created, files being uploaded
        REVIEW, // Data filled, ready for user to review PDF
        SIGNED,      // Finalized by user
        CANCELLED    // Cancelled by user
    }

    // --- LIFECYCLE CALLBACKS ---
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AgreementStatus.IN_PROGRESS;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
// Note: The `agreementData` field is crucial for storing the dynamic form data.