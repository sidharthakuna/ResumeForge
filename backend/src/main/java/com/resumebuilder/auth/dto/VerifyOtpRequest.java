package com.resumebuilder.auth.dto;

import com.resumebuilder.auth.enums.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VerifyOtpRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "OTP code is required")
        @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
        String otp,

        @NotNull(message = "Purpose is required")
        OtpPurpose purpose
) {}
