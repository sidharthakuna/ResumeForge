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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${google.client-id:}")
    private String configuredClientId;

    /**
     * Verify Google ID token and sign in or register user.
     */
    @Transactional
    public AuthResponse authenticateWithGoogle(String credentialToken) {
        if (credentialToken == null || credentialToken.isBlank()) {
            throw new InvalidCredentialsException("Missing Google credential token");
        }

        try {
            GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            );

            if (configuredClientId != null && !configuredClientId.isBlank()) {
                verifierBuilder.setAudience(Collections.singletonList(configuredClientId));
            }

            GoogleIdTokenVerifier verifier = verifierBuilder.build();
            GoogleIdToken idToken = verifier.verify(credentialToken.trim());

            if (idToken == null) {
                throw new InvalidCredentialsException("Invalid Google authentication token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleSubId = payload.getSubject();

            if (email == null || email.isBlank()) {
                throw new InvalidCredentialsException("Google account does not provide a verified email");
            }

            String normalizedEmail = email.trim().toLowerCase();
            Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);

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

        } catch (InvalidCredentialsException ice) {
            throw ice;
        } catch (Exception ex) {
            log.error("Google authentication failed", ex);
            throw new InvalidCredentialsException("Failed to verify Google account credentials: " + ex.getMessage());
        }
    }
}
