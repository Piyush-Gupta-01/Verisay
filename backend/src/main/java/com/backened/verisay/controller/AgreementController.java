package com.backened.verisay.controller;

import com.backened.verisay.model.Agreement;
import com.backened.verisay.model.FaceIdentity;
import com.backened.verisay.model.IdProof;
import com.backened.verisay.service.AgreementService;
import com.backened.verisay.service.AudioTranscriptionService.TranscriptionResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agreements")
@CrossOrigin(origins = "*") // For development only
public class AgreementController {

    @Autowired
    private AgreementService agreementService;

    // --- STEP 1: Create the Agreement Record ---
    @PostMapping("/save")
    public ResponseEntity<?> createAgreement(@RequestBody Map<String, Object> payload) {
        try {
            Integer userId = (Integer) payload.get("userId");
            String typeStr = (String) payload.get("type");
            String title = (String) payload.get("title");

            Agreement.AgreementType type = Agreement.AgreementType.valueOf(typeStr.toUpperCase());
            
            Agreement createdAgreement = agreementService.createInitialAgreement(userId, type, title);
            return ResponseEntity.ok(createdAgreement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- STEP 2: Upload All Files (these are called concurrently by the frontend) ---

    @PostMapping("/faceidentities/save")
    public ResponseEntity<?> uploadFaceIdentity(@RequestParam("agreementId") Long agreementId,
                                                @RequestParam("partyType") FaceIdentity.PartyType partyType,
                                                @RequestParam("file") MultipartFile file) {
        agreementService.savePartyFace(agreementId, partyType, file);
        return ResponseEntity.ok(Map.of("message", "Face for " + partyType + " uploaded successfully."));
    }

    @PostMapping("/id-proofs/save")
    public ResponseEntity<?> uploadIdProof(@RequestParam("agreementId") Long agreementId,
                                           @RequestParam("partyType") IdProof.PartyType partyType,
                                           @RequestParam("idProofType") IdProof.IdProofType idProofType,
                                           @RequestParam("file") MultipartFile file) {
        agreementService.savePartyIdProof(agreementId, partyType, idProofType, file);
        return ResponseEntity.ok(Map.of("message", "ID Proof for " + partyType + " uploaded successfully."));
    }

    @PostMapping("/audiorecords/save")
    public ResponseEntity<?> uploadAudioRecord(@RequestParam("agreementId") Long agreementId,
                                               @RequestParam("file") MultipartFile file) {
        agreementService.saveAgreementAudio(agreementId, file);
        return ResponseEntity.ok(Map.of("message", "Audio uploaded successfully."));
    }

    // --- STEP 3: Trigger AI Processing ---
    @GetMapping("/transcribe/{agreementId}")
    public ResponseEntity<TranscriptionResult> transcribeAgreementAudio(@PathVariable Long agreementId) {
        TranscriptionResult result = agreementService.processAgreementAudioAndExtractFields(agreementId);
        return ResponseEntity.ok(result);
    }
    
    // --- STEP 4: Complete with Manual Data ---
    @PostMapping("/complete-fields/{agreementId}")
    public ResponseEntity<Agreement> completeFields(@PathVariable Long agreementId, @RequestBody Map<String, Object> payload) {
        // The frontend sends a payload like {"fields": {...}}
        @SuppressWarnings("unchecked")
        Map<String, Object> fields = (Map<String, Object>) payload.get("fields");
        Agreement updatedAgreement = agreementService.completeAgreementFields(agreementId, fields);
        return ResponseEntity.ok(updatedAgreement);
    }

    // --- STEP 5: Finalize the Agreement ---
    @PutMapping("/update-status/{agreementId}")
    public ResponseEntity<Agreement> updateStatus(@PathVariable Long agreementId, @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        if ("SIGNED".equalsIgnoreCase(statusStr)) {
            Agreement finalizedAgreement = agreementService.finalizeAgreement(agreementId);
            return ResponseEntity.ok(finalizedAgreement);
        }
        // Can add more status updates here if needed later
        return ResponseEntity.badRequest().build();
    }


    // --- Other Utility Endpoints (for viewing data) ---
    
    @GetMapping("/{id}")
    public ResponseEntity<Agreement> getAgreementById(@PathVariable Long id) {
        return ResponseEntity.ok(agreementService.findAgreementById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Agreement>> getAgreementsForUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(agreementService.getAgreementsByUserId(userId));
    }
}
