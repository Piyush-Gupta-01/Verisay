// Signature.java
package com.backened.verisay.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "agreement_id")
    private Long agreementId;
    
    @Column(name = "image_path")
    private String imagePath;
   
    @Column(name = "signed_at")
    private LocalDateTime signedAt;
}
