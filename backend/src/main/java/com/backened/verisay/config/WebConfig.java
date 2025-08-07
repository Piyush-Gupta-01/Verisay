package com.backened.verisay.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Allow all endpoints
            .allowedOrigins("http://localhost:3000")  // Allow React Native frontend
            .allowedMethods("GET", "POST", "PUT", "DELETE")  // Allow these HTTP methods
            .allowedHeaders("*");  // Allow all headers
    }
}
