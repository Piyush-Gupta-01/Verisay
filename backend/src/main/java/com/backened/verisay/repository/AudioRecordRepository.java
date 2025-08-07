package com.backened.verisay.repository;

import com.backened.verisay.model.AudioRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AudioRecordRepository extends JpaRepository<AudioRecord, Long> {

    // Find all audio records for a given agreement.
    List<AudioRecord> findByAgreement_Id(Long agreementId);
    
    // Find the most recent audio record for an agreement. This is what we will use for transcription.
    // Spring Data JPA's "findFirst" or "findTop" keywords are perfect for this.
    Optional<AudioRecord> findTopByAgreement_IdOrderByUploadedAtDesc(Long agreementId);
}
