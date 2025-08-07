package com.backened.verisay.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Table(name = "id_proofs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CORRECTED RELATIONSHIP ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id", nullable = false)
    @JsonBackReference
    private Agreement agreement;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", nullable = false)
    private PartyType partyType;

    // This enum matches the frontend's values.
    @Enumerated(EnumType.STRING)
    @Column(name = "id_proof_type", nullable = false)
    private IdProofType idProofType;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public enum PartyType {
        PARTY1,
        PARTY2
    }

    // These values come directly from your frontend code.
    public enum IdProofType {
        AADHAAR,
        DL,
        VOTER,
        PASSPORT,
        PAN
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
