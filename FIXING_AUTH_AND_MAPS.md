# Complete Solution for Authentication & Maps Issues

## Frontend Fixes (Already Implemented)

We've fixed two major issues in the frontend code:

### 1. Authentication Fix
- We've fixed the issue where navigating to the debug page was logging you out
- The Authentication header is now preserved during page navigation
- The authentication status shows correctly in the debug page

### 2. Google Maps Debugging
- We've addressed the Google Maps API loading issues
- Created simplified debugging tools that don't cause errors
- Improved the Map Debugger component for better diagnosis

## Backend Fixes (Required)

For the system to work correctly, you **must** implement the CORS configuration in your backend as outlined in `CORS_SETUP.md`. This is critical for two reasons:

1. **403 Forbidden errors**: Without proper CORS setup, your requests will be rejected with 403 errors even when authentication is working correctly
2. **Authentication headers**: The Authorization header with your JWT token won't be properly accepted by the backend without CORS configuration

### Implementing the Backend Fix

1. **Create WebSecurityConfig.java** in the `com.crs.security` package:
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

2. **Add CORS properties** to `application.properties`:
   ```properties
   # CORS Configuration
   spring.web.cors.allowed-origins=http://localhost:3000
   spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
   spring.web.cors.allowed-headers=*
   spring.web.cors.allow-credentials=true
   ```

3. **Restart your Spring Boot application** for the changes to take effect

## Common Issues and Solutions

### Authentication Issues

1. **Token Not Being Saved**: Make sure the login process is correctly saving the token to localStorage:
   ```javascript
   localStorage.setItem('token', authToken);
   ```

2. **Header Not Being Set**: Ensure the token is being applied to the Authorization header:
   ```javascript
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

3. **Token Expiration**: JWT tokens typically expire after 24 hours. Check if your token is expired and may need renewal.

4. **CORS Preflight Failure**: Before making authenticated requests, browsers send an OPTIONS request to check CORS policy - this must be configured correctly on the backend.

### Vehicle Object Structure

When offering rides, make sure your payload matches the expected backend structure:

```javascript
const rideData = {
  pickupLocation: {
    address: formData.pickupLocation,
    latitude: formData.pickupCoordinates.lat,
    longitude: formData.pickupCoordinates.lng,
  },
  dropoffLocation: {
    address: formData.dropoffLocation,
    latitude: formData.dropoffCoordinates.lat,
    longitude: formData.dropoffCoordinates.lng,
  },
  departureDate: formData.date,
  departureTime: formData.time,
  maxPassengers: parseInt(formData.maxPassengers, 10),
  price: parseFloat(formData.pricePerSeat),  // Note: Backend expects "price", not "pricePerSeat"
  vehicle: {  
    model: formData.vehicleModel,
    color: formData.vehicleColor,
    licensePlate: formData.licensePlate
  }
};
```

## Testing Steps

1. **First, implement the backend changes** mentioned above
2. **Log in** to your application
3. **Verify authentication** by visiting http://localhost:3000/debug
   - If token is present but header isn't set, click "Fix Authorization Header"
4. **Test map loading** by visiting http://localhost:3000/map-debug
5. **Try offering a ride** which will test both your authentication and API structure

## Additional Backend Checks

If you're still experiencing issues after these changes:

1. **Check your backend logs** for detailed error messages
2. **Verify JWT validation** in the backend is processing the token correctly
3. **Confirm database connections** are working properly
4. **Test API endpoints** directly using Postman or the AuthDebugger page
