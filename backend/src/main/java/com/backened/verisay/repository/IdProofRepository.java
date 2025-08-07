package com.backened.verisay.repository;

import com.backened.verisay.model.IdProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IdProofRepository extends JpaRepository<IdProof, Long> {
    // Standard CRUD methods are sufficient.
}
