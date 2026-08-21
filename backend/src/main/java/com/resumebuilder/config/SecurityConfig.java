package com.resumebuilder.config;

import com.resumebuilder.auth.filter.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // This project authenticates purely via JwtAuthFilter, never via
    // AuthenticationManager/UserDetailsService — see the Design B decision
    // in DECISIONS.md. This bean exists ONLY to stop Spring Boot's
    // UserDetailsServiceAutoConfiguration from auto-generating an in-memory
    // fallback user (visible in boot logs as "Using generated security
    // password: ..."), which was interfering with our own auth flow.
    // It is never meant to be called; if it ever is, something upstream
    // is misconfigured and should fail loudly.
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException(
                    "This application does not use UserDetailsService-based authentication");
        };
    }

    // Configurable via CORS_ALLOWED_ORIGINS (comma-separated) so the real
    // frontend origin can be set as a Render env var once deployed,
    // without a code change + redeploy. Defaults to the original
    // localhost-only patterns, so local dev is completely unaffected --
    // python3 -m http.server's default port is 8080; localhost/127.0.0.1
    // are listed as separate origins because browsers treat them as
    // distinct. In production, set this to the actual frontend's origin
    // (e.g. https://your-frontend.onrender.com) -- exact origins, not
    // wildcard patterns, matching this class's original intent.
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:*,http://127.0.0.1:*}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(origin -> !origin.isBlank())
                        .toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("Content-Disposition"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/*/avatar").permitAll()
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/api/health"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                // Defense-in-depth response headers. These are layered on top
                // of Spring Security's defaults where applicable.
                .headers(headers -> headers
                        // Prevent browsers from MIME-sniffing the response type
                        .contentTypeOptions(contentType -> {})
                        // Block this site from being embedded in iframes (clickjacking)
                        .frameOptions(frame -> frame.deny())
                        // Content Security Policy (CSP)
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self';"))
                        // Limit referrer information leaked to external sites
                        .referrerPolicy(referrer ->
                                referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // Enable browser XSS filter and block rendering on detected attacks
                        .addHeaderWriter(new org.springframework.security.web.header.writers.StaticHeadersWriter(
                                "X-XSS-Protection", "1; mode=block"))
                        // Restrict powerful browser features this app doesn't use.
                        .addHeaderWriter(new org.springframework.security.web.header.writers.StaticHeadersWriter(
                                "Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()"))
                        // Prevent intermediary proxy caching of sensitive user API responses
                        .addHeaderWriter(new org.springframework.security.web.header.writers.StaticHeadersWriter(
                                "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0"))
                        .addHeaderWriter(new org.springframework.security.web.header.writers.StaticHeadersWriter(
                                "Pragma", "no-cache"))
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write(
                                    "{\"success\":false,\"data\":null,\"message\":\"Authentication required\"}");
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}