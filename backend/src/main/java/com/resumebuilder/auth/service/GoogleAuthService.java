package com.resumebuilder.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.resumebuilder.auth.dto.AuthResponse;
import com.resumebuilder.common.exception.InvalidCredentialsException;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.enums.AuthProvider;
import com.resumebuilder.user.enums.Role;
import com.resumebuilder.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client-id:}")
    private String configuredClientId;

    /**
     * Verify Google ID token or OAuth2 Access Token and sign in or register user.
     */
    @Transactional
    public AuthResponse authenticateWithGoogle(String credentialToken) {
        if (credentialToken == null || credentialToken.isBlank()) {
            throw new InvalidCredentialsException("Missing Google credential token");
        }

        String rawToken = credentialToken.trim();
        String email = null;
        String name = null;
        String pictureUrl = null;
        String googleSubId = null;

        // 1. Try verifying as Google ID Token (JWT with 3 parts)
        if (rawToken.split("\\.").length == 3) {
            try {
                GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance()
                );

                if (configuredClientId != null && !configuredClientId.isBlank()) {
                    verifierBuilder.setAudience(Collections.singletonList(configuredClientId));
                }

                GoogleIdTokenVerifier verifier = verifierBuilder.build();
                GoogleIdToken idToken = verifier.verify(rawToken);

                if (idToken != null) {
                    GoogleIdToken.Payload payload = idToken.getPayload();
                    email = payload.getEmail();
                    name = (String) payload.get("name");
                    pictureUrl = (String) payload.get("picture");
                    googleSubId = payload.getSubject();
                }
            } catch (Exception e) {
                log.debug("Could not parse as JWT ID token, attempting Google UserInfo API: {}", e.getMessage());
            }
        }

        // 2. If not a JWT or verification did not extract email, verify as OAuth2 Access Token via Google UserInfo API
        if (email == null || email.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(rawToken);
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        HttpMethod.GET,
                        entity,
                        new ParameterizedTypeReference<>() {}
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    email = (String) body.get("email");
                    name = (String) body.get("name");
                    pictureUrl = (String) body.get("picture");
                    googleSubId = (String) body.get("sub");
                }
            } catch (Exception ex) {
                log.error("Google UserInfo API verification failed: {}", ex.getMessage());
                throw new InvalidCredentialsException("Invalid Google authentication token: " + ex.getMessage());
            }
        }

        if (email == null || email.isBlank()) {
            throw new InvalidCredentialsException("Google account does not provide a verified email");
        }

        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.getGoogleSubId() == null && googleSubId != null) {
                user.setGoogleSubId(googleSubId);
            }
            user.setEmailVerified(true);
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setFullName(name != null && !name.isBlank() ? name : "Google User");
            user.setRole(Role.USER);
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setGoogleSubId(googleSubId);
            user.setEmailVerified(true);
            user.setProfilePicturePath(pictureUrl);
            userRepository.save(user);
            log.info("Registered new user via Google OAuth: {}", normalizedEmail);
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }
}
