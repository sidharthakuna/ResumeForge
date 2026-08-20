package com.resumebuilder.auth.service;

import com.resumebuilder.auth.dto.AuthResponse;
import com.resumebuilder.auth.dto.LoginRequest;
import com.resumebuilder.auth.dto.RegisterRequest;
import com.resumebuilder.common.exception.InvalidCredentialsException;
import com.resumebuilder.common.exception.RateLimitExceededException;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.enums.Role;
import com.resumebuilder.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginRateLimiterService loginRateLimiterService;

    public AuthResponse register(RegisterRequest request) {
        return register(request, "127.0.0.1");
    }

    public AuthResponse register(RegisterRequest request, String clientIp) {
        if (!loginRateLimiterService.tryConsumeRegistration(clientIp)) {
            throw new RateLimitExceededException(
                    "Too many registration attempts. Please try again later.");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new InvalidCredentialsException("Registration failed");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(Role.USER);

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request, String clientIp) {
        // Normalized (lowercased, trimmed) so "User@Example.com" and
        // "user@example.com" share one rate-limit bucket -- matches
        // LoginRateLimiterService's own documented contract for the
        // emailKey it's given. This normalization is scoped ONLY to the
        // rate-limit key, not the DB lookup below -- that lookup still
        // uses request.email() exactly as before this change, since
        // email storage/lookup here is already case-sensitive as-typed
        // (see User.email / UserRepository.findByEmail, neither of which
        // normalizes case) and changing that is a separate concern from
        // rate limiting, out of scope here.
        String normalizedEmail = request.email().trim().toLowerCase();

        // Checked before the DB fetch, same reasoning AiRateLimiterService
        // already uses for its own endpoints: a throttled request should
        // fail fast without spending a query, and here specifically
        // without giving an attacker a timing side-channel between
        // "email exists" and "email doesn't" via query latency.
        if (!loginRateLimiterService.tryConsume(clientIp, normalizedEmail)) {
            throw new RateLimitExceededException(
                    "Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }
}