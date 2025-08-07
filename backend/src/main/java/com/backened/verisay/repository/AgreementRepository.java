package com.backened.verisay.repository;

import com.backened.verisay.model.Agreement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgreementRepository extends JpaRepository<Agreement, Long> {

    // --- Core Finders ---

    // Find by User ID (this is the standard, preferred way)
    List<Agreement> findByUser_Id(Integer userId);

    // Find by User ID with sorting/pagination
    List<Agreement> findByUser_IdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    // --- Finders by Status or Type ---

    List<Agreement> findByStatus(Agreement.AgreementStatus status);

    List<Agreement> findByUser_IdAndStatus(Integer userId, Agreement.AgreementStatus status);
    
    List<Agreement> findByType(Agreement.AgreementType type);

    List<Agreement> findByUser_IdAndType(Integer userId, Agreement.AgreementType type);
    
    // --- Counter Methods ---
    
    long countByUser_Id(Integer userId);
    
    long countByStatus(Agreement.AgreementStatus status);

    long countByUser_IdAndStatus(Integer userId, Agreement.AgreementStatus status);

    // --- Search ---

    // Find by title (your version was already perfect)
    List<Agreement> findByTitleContainingIgnoreCase(String title);
}
