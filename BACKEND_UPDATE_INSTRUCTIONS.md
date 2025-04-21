# Backend Update Instructions

You're experiencing a bean name conflict because we tried to add a new security configuration while your project already has one. Follow these steps to fix your CORS issue properly:

## 1. Update SecurityConfig.java

Open your existing `SecurityConfig.java` file:
```
crs-api/src/main/java/com/crs/security/SecurityConfig.java
```

Add the following modifications:

1. **Add imports** at the top of the file:
```java
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
```

2. **Add the corsConfigurationSource bean** inside the class:
```java
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
```

3. **Modify your existing securityFilterChain method** by adding `.cors().configurationSource(corsConfigurationSource()).and()` before the rest of your configuration:
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        // Add this line to enable CORS
        .cors().configurationSource(corsConfigurationSource()).and()
        // Your existing configuration continues here
        .csrf().disable()
        // ... rest of your configuration
        .build();
}
```

## 2. Update application.properties

Open your existing `application.properties` file:
```
crs-api/src/main/resources/application.properties
```

Add these properties:
```properties
# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# Allow bean definition overriding to fix conflicts
spring.main.allow-bean-definition-overriding=true
```

## 3. Restart Your Backend

After making these changes, restart your Spring Boot application. The CORS configuration will now be properly applied, and the conflict with bean definitions will be resolved.

## What These Changes Do

1. **CORS Configuration**: Allows your React frontend (running on localhost:3000) to communicate with your Spring Boot backend
2. **Bean Overriding**: Ensures there's no conflict if you have multiple security configurations
3. **Authentication Headers**: Properly handles Authorization headers from your frontend requests

You should now be able to make authenticated requests from your frontend to your backend without CORS errors.
