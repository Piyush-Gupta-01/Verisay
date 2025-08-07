package com.backened.verisay.service;

import com.backened.verisay.model.*;
import com.backened.verisay.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AgreementService {

    // --- REPOSITORIES ---
    @Autowired private AgreementRepository agreementRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AudioRecordRepository audioRecordRepository;
    @Autowired private FaceIdentityRepository faceIdentityRepository;
    @Autowired private IdProofRepository idProofRepository;

    // --- TOOL SERVICES ---
    @Autowired private FileStorageService fileStorageService;
    @Autowired private AudioTranscriptionService transcriptionService;

    /**
     * Step 1: Creates the initial agreement record.
     * Called by the frontend to get an agreementId before uploading files.
     */
    public Agreement createInitialAgreement(Integer internalUserId, Agreement.AgreementType type, String title) {
        User user = userRepository.findById(internalUserId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + internalUserId));
        
        Agreement agreement = Agreement.builder()
                .user(user)
                .type(type)
                .title(title)
                .status(Agreement.AgreementStatus.IN_PROGRESS)
                .agreementData(Collections.emptyMap()) // Initialize with empty data
                .build();
        
        return agreementRepository.save(agreement);
    }

    /**
     * Handles uploading and saving the path for Party Face images.
     */
    public void savePartyFace(Long agreementId, FaceIdentity.PartyType partyType, MultipartFile file) {
        Agreement agreement = findAgreementById(agreementId);
        String filePath = fileStorageService.store(file, "faces");

        FaceIdentity faceIdentity = FaceIdentity.builder()
                .agreement(agreement)
                .partyType(partyType)
                .imagePath(filePath)
                .build();
        
        faceIdentityRepository.save(faceIdentity);
    }

    /**
     * Handles uploading and saving the path for Party ID proofs.
     */
    public void savePartyIdProof(Long agreementId, IdProof.PartyType partyType, IdProof.IdProofType idProofType, MultipartFile file) {
        Agreement agreement = findAgreementById(agreementId);
        String filePath = fileStorageService.store(file, "id-proofs");

        IdProof idProof = IdProof.builder()
                .agreement(agreement)
                .partyType(partyType)
                .idProofType(idProofType)
                .filePath(filePath)
                .build();
        
        idProofRepository.save(idProof);
    }
    
    /**
     * Handles uploading and saving the path for the agreement audio.
     */
    public void saveAgreementAudio(Long agreementId, MultipartFile file) {
        Agreement agreement = findAgreementById(agreementId);
        String filePath = fileStorageService.store(file, "audio");

        AudioRecord audioRecord = AudioRecord.builder()
                .agreement(agreement)
                .filePath(filePath)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .status(AudioRecord.AudioStatus.UPLOADED)
                .build();
                
        audioRecordRepository.save(audioRecord);
    }

    /**
     * Step 2: The Core AI Processing Logic.
     * This is called by the frontend after all files are uploaded.
     */
    public AudioTranscriptionService.TranscriptionResult processAgreementAudioAndExtractFields(Long agreementId) {
        Agreement agreement = findAgreementById(agreementId);

        // Find the latest audio record for this agreement
        AudioRecord audioRecord = audioRecordRepository.findTopByAgreement_IdOrderByUploadedAtDesc(agreementId)
                .orElse(null);

        AudioTranscriptionService.TranscriptionResult result;
        
        if (audioRecord != null) {
            // If audio exists, process it
            result = transcriptionService.processAudio(audioRecord.getFilePath(), agreement.getType());
        } else {
            // If no audio, return a result indicating all required fields are missing
            List<String> requiredFields = transcriptionService.getRequiredFieldsForType(agreement.getType());
            result = new AudioTranscriptionService.TranscriptionResult(Collections.emptyMap(), requiredFields);
        }

        // Save the extracted fields to the agreement's JSON data column
        agreement.setAgreementData(result.getExtractedFields());
        agreementRepository.save(agreement);
        
        return result;
    }

    /**
     * Step 3: Completes the agreement with data manually entered by the user.
     */
    public Agreement completeAgreementFields(Long agreementId, Map<String, Object> allFields) {
        Agreement agreement = findAgreementById(agreementId);

        // The map of fields contains both AI-extracted and user-entered data.
        // We simply overwrite the entire JSON map.
        agreement.setAgreementData(allFields);
        agreement.setStatus(Agreement.AgreementStatus.REVIEW); // Ready for final review
        
        return agreementRepository.save(agreement);
    }

    /**
     * Step 4: Finalizes the agreement.
     */
    public Agreement finalizeAgreement(Long agreementId) {
        Agreement agreement = findAgreementById(agreementId);
        agreement.setStatus(Agreement.AgreementStatus.SIGNED);
        agreement.setSignedAt(java.time.LocalDateTime.now());
        
        return agreementRepository.save(agreement);
    }

    // Helper method to find an agreement or throw an exception
    public Agreement findAgreementById(Long agreementId) {
        return agreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException("Agreement not found with ID: " + agreementId));
    }
    
    // You can keep other simple finders/getters from your old service if you need them.
    public List<Agreement> getAgreementsByUserId(Integer userId) {
        return agreementRepository.findByUser_Id(userId);
    }
}
