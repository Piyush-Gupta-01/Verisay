package com.backened.verisay.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgreementParty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String partyType;      // party1 or party2
    private String faceImage;      // local path
    private String idProofType;    // Aadhaar, PAN, etc.
    private String voiceRecording; // optional, only for party1

  @ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "agreement_id", nullable = false)
private Agreement agreement;
}
