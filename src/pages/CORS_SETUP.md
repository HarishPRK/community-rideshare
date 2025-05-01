# CORS Setup for Backend

This document explains how to fix the CORS (Cross-Origin Resource Sharing) issues in your backend application.

## Problem

Your frontend application running on `http://localhost:3000` cannot communicate with your backend API running on `http://localhost:8080` due to CORS restrictions. This is evidenced by errors like:

```
Access to XMLHttpRequest at 'http://localhost:8080/api/rides/request' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution

Add the following configuration to your Spring Boot backend application:

### 1. Create WebSecurityConfig.java

Create or modify the file `WebSecurityConfig.java` in your `com.crs.security` package:

```java
package com.crs.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter; // Your existing JWT filter
    
    // Constructor with your existing dependencies
    public WebSecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .cors().configurationSource(corsConfigurationSource()).and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### 2. Add CORS properties to application.properties

Add these properties to your `application.properties` file:

```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 3. Restart your Spring Boot application

After making these changes, restart your Spring Boot application for the changes to take effect.

## Why This Works

The solution ensures that:

1. CORS is processed before authentication checks
2. The frontend origin (http://localhost:3000) is explicitly allowed
3. All necessary HTTP methods and headers are permitted
4. Credentials (like cookies or Authorization headers) are allowed to be sent cross-origin

This configuration allows your React frontend to communicate with your Java backend while maintaining security.
