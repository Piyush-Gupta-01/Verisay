package com.backened.verisay.model;

import com.fasterxml.jackson.annotation.JsonBackReference;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audio_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CORRECTED RELATIONSHIP ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id", nullable = false)
    @JsonBackReference
    private Agreement agreement;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    // Other fields are good
    private String fileName;
    private Long fileSize; // In bytes
    private String contentType;

    @Enumerated(EnumType.STRING)
    private AudioStatus status;

    public enum AudioStatus {
        UPLOADED,
        PROCESSING_TRANSCRIPTION,
        PROCESSED_SUCCESS,
        PROCESSED_FAILED
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (status == null) {
            status = AudioStatus.UPLOADED;
        }
    }
}
