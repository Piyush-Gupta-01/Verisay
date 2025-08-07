package com.backened.verisay.service;

import com.backened.verisay.model.FinalPDF;
import com.backened.verisay.repository.FinalPDFRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FinalPDFService {

    @Autowired
    private FinalPDFRepository finalPDFRepository;

    // Method to save final PDF
    public FinalPDF saveFinalPDF(FinalPDF finalPDF) {
        return finalPDFRepository.save(finalPDF);
    }

    // Method to get all final PDFs
    public List<FinalPDF> getAllFinalPDFs() {
        return finalPDFRepository.findAll();
    }

    // Method to get final PDF by ID
    public FinalPDF getFinalPDFById(Long finalPdfId) {
        return finalPDFRepository.findById(finalPdfId)
                .orElseThrow(() -> new RuntimeException("Final PDF not found"));
    }

    // Method to delete final PDF by ID
    public void deleteFinalPDF(Long finalPdfId) {
        FinalPDF finalPDF = finalPDFRepository.findById(finalPdfId)
                .orElseThrow(() -> new RuntimeException("Final PDF not found"));
        finalPDFRepository.delete(finalPDF);
    }
}
