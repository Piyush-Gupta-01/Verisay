package com.backened.verisay.repository;

import com.backened.verisay.model.FaceIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FaceIdentityRepository extends JpaRepository<FaceIdentity, Long> {
    // Standard CRUD methods are sufficient.
}
