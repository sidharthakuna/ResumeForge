package com.resumebuilder.auth.service;

import com.resumebuilder.auth.dto.*;
import com.resumebuilder.auth.enums.OtpPurpose;
import com.resumebuilder.common.exception.InvalidCredentialsException;
import com.resumebuilder.common.exception.RateLimitExceededException;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.enums.AuthProvider;
import com.resumebuilder.user.enums.Role;
import com.resumebuilder.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginRateLimiterService loginRateLimiterService;
    private final OtpService otpService;
    private final GoogleAuthService googleAuthService;

    public AuthResponse register(RegisterRequest request) {
        return register(request, "127.0.0.1");
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String clientIp) {
        if (!loginRateLimiterService.tryConsumeRegistration(clientIp)) {
            throw new RateLimitExceededException(
                    "Too many registration attempts. Please try again later.");
        }

        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new InvalidCredentialsException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setRole(Role.USER);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setEmailVerified(false);

        userRepository.save(user);

        // Send registration verification OTP to email
        try {
            otpService.generateAndSendOtp(normalizedEmail, OtpPurpose.REGISTRATION);
        } catch (Exception ex) {
            log.warn("Could not dispatch registration OTP automatically: {}", ex.getMessage());
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (!loginRateLimiterService.tryConsume(clientIp, normalizedEmail)) {
            throw new RateLimitExceededException(
                    "Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    /**
     * Send OTP for registration or password reset.
     */
    public void sendOtp(SendOtpRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (request.purpose() == OtpPurpose.PASSWORD_RESET && !userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new InvalidCredentialsException("No account found with this email. Please check your email or create an account.");
        }
        otpService.generateAndSendOtp(normalizedEmail, request.purpose());
    }

    /**
     * Verify OTP and mark user email as verified.
     */
    @Transactional
    public void verifyEmailOtp(VerifyOtpRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        otpService.verifyOtp(normalizedEmail, request.otp(), request.purpose());

        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(user -> {
            user.setEmailVerified(true);
            userRepository.save(user);
        });
    }

    /**
     * Request a password reset OTP.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            otpService.generateAndSendOtp(normalizedEmail, OtpPurpose.PASSWORD_RESET);
        } else {
            log.info("Password reset requested for non-registered email: {}", normalizedEmail);
            throw new InvalidCredentialsException("No account found with this email. Please check your email or create an account.");
        }
    }

    /**
     * Validate OTP and set new password.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        otpService.verifyOtp(normalizedEmail, request.otp(), OtpPurpose.PASSWORD_RESET);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User account not found"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Password successfully reset for user: {}", normalizedEmail);
    }

    /**
     * Authenticate via Google OAuth ID token.
     */
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        return googleAuthService.authenticateWithGoogle(request.credential());
    }
}