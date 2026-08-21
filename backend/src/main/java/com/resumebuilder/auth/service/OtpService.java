package com.resumebuilder.auth.service;

import com.resumebuilder.auth.entity.EmailOtp;
import com.resumebuilder.auth.enums.OtpPurpose;
import com.resumebuilder.auth.repository.EmailOtpRepository;
import com.resumebuilder.common.exception.InvalidCredentialsException;
import com.resumebuilder.common.exception.RateLimitExceededException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int COOLDOWN_SECONDS = 45;

    /**
     * Generate and dispatch a 6-digit OTP code to the requested email.
     */
    @Transactional
    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        String normalizedEmail = email.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        // 1. Cooldown rate-limit check (prevent spamming)
        Optional<EmailOtp> latestOtp = emailOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(normalizedEmail, purpose);
        if (latestOtp.isPresent()) {
            LocalDateTime createdAt = latestOtp.get().getCreatedAt();
            if (createdAt != null && createdAt.plusSeconds(COOLDOWN_SECONDS).isAfter(now)) {
                long secondsRemaining = java.time.Duration.between(now, createdAt.plusSeconds(COOLDOWN_SECONDS)).getSeconds();
                throw new RateLimitExceededException("Please wait " + Math.max(1, secondsRemaining) + "s before requesting a new code.");
            }
        }

        // 2. Generate cryptographically random 6-digit OTP
        int code = secureRandom.nextInt(1_000_000);
        String otpCode = String.format("%06d", code);

        // 3. Save to database
        EmailOtp otpEntity = new EmailOtp();
        otpEntity.setEmail(normalizedEmail);
        otpEntity.setOtpCode(otpCode);
        otpEntity.setPurpose(purpose);
        otpEntity.setExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
        otpEntity.setUsed(false);

        emailOtpRepository.save(otpEntity);

        // 4. Send via email
        if (purpose == OtpPurpose.REGISTRATION) {
            emailService.sendVerificationOtpEmail(normalizedEmail, otpCode);
        } else if (purpose == OtpPurpose.PASSWORD_RESET) {
            emailService.sendPasswordResetOtpEmail(normalizedEmail, otpCode);
        }
    }

    /**
     * Validate an OTP code. Marks the code as used if valid.
     */
    @Transactional
    public boolean verifyOtp(String email, String rawOtp, OtpPurpose purpose) {
        String normalizedEmail = email.trim().toLowerCase();
        String cleanOtp = rawOtp.trim();
        LocalDateTime now = LocalDateTime.now();

        Optional<EmailOtp> otpOpt = emailOtpRepository.findTopByEmailAndPurposeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                normalizedEmail,
                purpose,
                now
        );

        if (otpOpt.isEmpty()) {
            throw new InvalidCredentialsException("Invalid or expired verification code.");
        }

        EmailOtp otpEntity = otpOpt.get();
        if (!otpEntity.getOtpCode().equals(cleanOtp)) {
            throw new InvalidCredentialsException("Incorrect verification code. Please check and try again.");
        }

        otpEntity.setUsed(true);
        emailOtpRepository.save(otpEntity);
        return true;
    }
}
