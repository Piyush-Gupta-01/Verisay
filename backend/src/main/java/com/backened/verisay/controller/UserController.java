package com.backened.verisay.controller;

import com.backened.verisay.model.User;
import com.backened.verisay.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // For development only
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * The FIRST endpoint called by the frontend.
     * It receives the Firebase UID and returns our internal database User ID.
     */
    @PostMapping("/getInternalId")
    public ResponseEntity<Map<String, Object>> getInternalId(@RequestBody Map<String, String> payload) {
        String firebaseUid = payload.get("firebaseUid");
        if (firebaseUid == null || firebaseUid.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "firebaseUid is required."));
        }

        // Use the findOrCreateUser method to handle both existing and new users
        User user = userService.findOrCreateUser(firebaseUid, payload.get("email"), payload.get("fullName"));
        
        // Return the internal ID as expected by the frontend
        return ResponseEntity.ok(Map.of("internalUserId", user.getId()));
    }
}
