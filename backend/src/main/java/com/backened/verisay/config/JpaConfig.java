package com.backened.verisay.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class JpaConfig {
    // Remove all the manual bean configurations
    // Spring Boot will auto-configure everything based on application.properties
}
