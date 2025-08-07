package com.backened.verisay.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // This will be configured in your application.properties file
    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    // This method runs after the service is created and sets up the storage directory.
    @PostConstruct
    public void init() {
        try {
            rootLocation = Paths.get(uploadDir);
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    /**
     * Stores a file with a unique name to prevent collisions.
     * @param file The MultipartFile to store.
     * @param subDirectory A subdirectory within the main storage (e.g., "faces", "ids", "audio").
     * @return The path to the stored file, relative to the root storage location.
     */
    public String store(MultipartFile file, String subDirectory) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        // 1. Sanitize filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        // 2. Create a unique filename to avoid overwrites
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;

        try {
            // 3. Create the specific subdirectory if it doesn't exist
            Path targetDirectory = this.rootLocation.resolve(subDirectory);
            Files.createDirectories(targetDirectory);
            
            Path destinationFile = targetDirectory.resolve(uniqueFilename).normalize().toAbsolutePath();
            
            // 4. Copy the file to the target location
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // 5. Return the path relative to the root location for storing in the DB
            return Paths.get(subDirectory, uniqueFilename).toString().replace("\\", "/");

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalFilename, e);
        }
    }

    // You might also need a method to load files later
    // public Resource loadAsResource(String filename) { ... }
}
