package com.backened.verisay.service;

import com.backened.verisay.config.OpenAIProperties;
import com.backened.verisay.model.Agreement;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AudioTranscriptionService {

    @Autowired
    private OpenAIProperties openAIProperties;

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // This inner class is a DTO (Data Transfer Object) to hold the results cleanly.
    public static class TranscriptionResult {
        private final Map<String, Object> extractedFields;
        private final List<String> missingFields;

        public TranscriptionResult(Map<String, Object> extractedFields, List<String> missingFields) {
            this.extractedFields = extractedFields;
            this.missingFields = missingFields;
        }

        public Map<String, Object> getExtractedFields() { return extractedFields; }
        public List<String> getMissingFields() { return missingFields; }
    }

    /**
     * The main public method of this service.
     * It takes a file path and an agreement type, and returns the extracted and missing fields.
     */
    public TranscriptionResult processAudio(String relativeFilePath, Agreement.AgreementType agreementType) {
        // 1. Construct the full, absolute path to the file
        Path fullPath = Paths.get(uploadDir).resolve(relativeFilePath);
        File audioFile = fullPath.toFile();

        if (!audioFile.exists()) {
            throw new RuntimeException("Audio file not found for processing: " + fullPath);
        }

        try {
            // 2. Transcribe the audio file using OpenAI Whisper
            String transcribedText = transcribeWithWhisper(audioFile);

            // 3. Extract key-value fields from the transcript
            Map<String, Object> extractedFields = extractFieldsFromText(transcribedText, agreementType);
            
            // 4. Determine which required fields are missing
            List<String> requiredFieldKeys = getRequiredFieldsForType(agreementType);
            List<String> missingFieldKeys = new ArrayList<>();
            for (String key : requiredFieldKeys) {
                if (extractedFields.get(key) == null || String.valueOf(extractedFields.get(key)).isBlank()) {
                    missingFieldKeys.add(key);
                }
            }

            // 5. Return the result in our clean DTO
            return new TranscriptionResult(extractedFields, missingFieldKeys);
            
        } catch (Exception e) {
            // If anything goes wrong, we assume all fields are missing.
            // This provides a graceful fallback to the manual form.
            return new TranscriptionResult(Collections.emptyMap(), getRequiredFieldsForType(agreementType));
        }
    }

    private String transcribeWithWhisper(File audioFile) throws Exception {
        // ... (The rest of this method is the same as your `transcribeAudio` method)
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(audioFile));
        body.add("model", "whisper-1");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(openAIProperties.getKey());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(
                openAIProperties.getUrl(), requestEntity, String.class);

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("OpenAI API error: " + response.getBody());
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        return root.get("text").asText();
    }
    
    // --- The helper methods for extraction remain largely the same ---
    // You have these already, just make sure they return Map<String, Object>

    public List<String> getRequiredFieldsForType(Agreement.AgreementType type) {
         // This can be mapped from your AGREEMENT_FIELDS constant from the frontend
         // for perfect synchronization. For now, a map is fine.
        return switch (type) {
            case RENTAL -> List.of("landlordName", "tenantName", "propertyAddress", "rentAmount", "startDate", "endDate");
            case LOAN -> List.of("lenderName", "borrowerName", "loanAmount", "interestRate", "repaymentPeriod", "startDate");
            // Add other types
            default -> Collections.emptyList();
        };
    }

    private Map<String, Object> extractFieldsFromText(String text, Agreement.AgreementType agreementType) {
        // ... your extraction logic (extractRentalFields, etc.) goes here
        // Just ensure it returns Map<String, Object>
        return new HashMap<>(); // Placeholder
    }
    
    // Example:
    private Map<String, Object> extractRentalFields(String text) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("landlordName", extractPattern(text, "(Landlord name is|Landlord|Owner)\\s*:?\\s*([A-Za-z ]+)"));
        // ... other fields
        return fields;
    }

    private String extractPattern(String text, String regex) {
        // ... your existing extractPattern method
        return ""; // Placeholder
    }
}
