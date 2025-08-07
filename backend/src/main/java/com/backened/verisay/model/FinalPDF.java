// FinalPDF.java
package com.backened.verisay.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinalPDF {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "agreement_id")
    private Long agreementId;
    
    @Column(name="file_path")
    private String filePath;

    @Lob
    @Column(name = "blockchain_hash")
    private String blockchainHash;
    
    @Column(name="created_at")
    private LocalDateTime createdAt;
}
