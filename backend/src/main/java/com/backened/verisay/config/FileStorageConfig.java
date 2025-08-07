package com.backened.verisay.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Bean
    public Path uploadPath() {
        Path path = Paths.get(System.getProperty("user.dir"), "uploads");
        try {
            // Ensure the directory exists
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
        return path;
    }
}
