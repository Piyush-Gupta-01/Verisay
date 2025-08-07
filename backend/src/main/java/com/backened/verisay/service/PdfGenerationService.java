package com.backened.verisay.service;

import com.backened.verisay.model.Agreement;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class PdfGenerationService {

    // Helper method to add a paragraph with specific font and spacing
    private void addParagraph(Document document, String text, Font font, float spacingAfter) throws DocumentException {
        Paragraph p = new Paragraph(text, font);
        p.setSpacingAfter(spacingAfter);
        document.add(p);
    }

    // Helper method to get data from the agreement map safely
    private String get(Map<String, Object> data, String key) {
        return data.getOrDefault(key, "N/A").toString();
    }

    public ByteArrayInputStream generateAgreementPdf(Agreement agreement) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Define fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.NORMAL);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.NORMAL);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Font.NORMAL);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Font.NORMAL);

            // 1. Add Title
            Paragraph title = new Paragraph(agreement.getTitle().toUpperCase(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            // 2. Introduction
            addParagraph(document, "This agreement is made on " +
                    agreement.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")) + ".", bodyFont, 15f);

            Map<String, Object> data = agreement.getAgreementData();

            // 3. Render Agreement-Specific Details (Example for RENTAL)
            // You can use a switch statement for different agreement types
            switch (agreement.getType()) {
                case RENTAL:
                    renderRentalDetails(document, data, labelFont, bodyFont);
                    break;
                case LOAN:
                    // renderLoanDetails(document, data, labelFont, bodyFont);
                    break;
                // Add other cases
            }

            // 4. Closing Clause
            addParagraph(document, "By signing below, the parties acknowledge that they have read, understood, and agree to the terms and conditions of this agreement.", bodyFont, 30f);
            
            // 5. Signature Section
            addParagraph(document, "Signatures:", headerFont, 20f);
            
            Paragraph p1 = new Paragraph("Party 1: _________________________          Party 2: _________________________", bodyFont);
            document.add(p1);


            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
    
    // Renders the specific fields for a Rental Agreement
    private void renderRentalDetails(Document document, Map<String, Object> data, Font labelFont, Font bodyFont) throws DocumentException {
        Table table = new Table(2); // 2 columns
        table.setBorder(Rectangle.NO_BORDER);
        table.setWidth(100);
        table.setPadding(5);

        // Helper to add rows
        java.util.function.BiConsumer<String, String> addRow = (label, value) -> {
            table.addCell(new Paragraph(label, labelFont));
            table.addCell(new Paragraph(value, bodyFont));
        };

        addRow.accept("Landlord Name:", get(data, "landlordName"));
        addRow.accept("Tenant Name:", get(data, "tenantName"));
        addRow.accept("Property Address:", get(data, "propertyAddress"));
        addRow.accept("Monthly Rent:", get(data, "rentAmount"));
        addRow.accept("Security Deposit:", get(data, "securityDeposit"));
        addRow.accept("Lease Start Date:", get(data, "startDate"));
        addRow.accept("Lease End Date:", get(data, "endDate"));
        
        document.add(table);
    }
}
