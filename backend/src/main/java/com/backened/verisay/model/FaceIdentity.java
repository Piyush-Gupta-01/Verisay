package com.backened.verisay.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Table(name = "face_identities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CORRECTED RELATIONSHIP ---
    // This correctly creates an 'agreement_id' foreign key column.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id", nullable = false)
    @JsonBackReference
    private Agreement agreement;

    // Using an enum is safer and clearer than a String or Integer.
    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", nullable = false)
    private PartyType partyType;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "captured_at", updatable = false)
    private LocalDateTime capturedAt;

    public enum PartyType {
        PARTY1,
        PARTY2
    }

    @PrePersist
    protected void onCreate() {
        capturedAt = LocalDateTime.now();
    }
}
