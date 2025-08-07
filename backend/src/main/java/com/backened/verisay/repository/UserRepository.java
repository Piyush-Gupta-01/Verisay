package com.backened.verisay.repository;

import com.backened.verisay.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // CRUCIAL: Must return Optional<User> to safely handle cases where the user is not found.
    Optional<User> findByFirebaseUid(String firebaseUid);

}
