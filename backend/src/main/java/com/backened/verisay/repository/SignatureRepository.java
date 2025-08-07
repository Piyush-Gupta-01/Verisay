package com.backened.verisay.repository;

import com.backened.verisay.model.Signature;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignatureRepository extends JpaRepository<Signature, Long> {
}
