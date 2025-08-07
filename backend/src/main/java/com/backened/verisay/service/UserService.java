package com.backened.verisay.service;

import com.backened.verisay.exception.UserNotFoundException; // We will create this exception class
import com.backened.verisay.model.User;
import com.backened.verisay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional // Good practice to have transactional boundaries at the service level
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Finds a user by their Firebase UID.
     * This is a simple lookup method.
     * @param firebaseUid The unique ID from Firebase Authentication.
     * @return The User entity.
     * @throws UserNotFoundException if no user with the given UID is found.
     */
    @Transactional(readOnly = true)
    public User getUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UserNotFoundException("User not found with Firebase UID: " + firebaseUid));
    }

    /**
     * The primary method for our application flow. It finds a user by their Firebase UID,
     * or creates a new one if they don't exist in our database yet.
     * @param firebaseUid The unique ID from Firebase Authentication.
     * @param email The user's email (can be null if not provided).
     * @param fullName The user's full name (can be null if not provided).
     * @return The existing or newly created User entity.
     */
    public User findOrCreateUser(String firebaseUid, String email, String fullName) {
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);
        
        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setEmail(email);
            newUser.setFullName(fullName);
            newUser.setCreatedAt(LocalDateTime.now()); // Set creation timestamp
            return userRepository.save(newUser);
        }
    }

    /**
     * Finds a user by their internal database ID.
     */
    @Transactional(readOnly = true)
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
    }
    
    /**
     * A simple method to save or update a user.
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Retrieves all users. Useful for admin purposes.
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
