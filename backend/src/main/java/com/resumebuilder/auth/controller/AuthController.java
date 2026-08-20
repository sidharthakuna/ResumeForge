package com.resumebuilder.auth.controller;

import com.resumebuilder.auth.dto.AuthResponse;
import com.resumebuilder.auth.dto.LoginRequest;
import com.resumebuilder.auth.dto.RegisterRequest;
import com.resumebuilder.auth.service.AuthService;
import com.resumebuilder.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.register(request, resolveClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, resolveClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Resolves the real client IP for rate-limiting purposes (see
    // LoginRateLimiterService). Deliberately NOT using Spring's built-in
    // server.forward-headers-strategy=native support -- that mode trusts
    // the FIRST entry in X-Forwarded-For by default, which is only safe
    // if the edge proxy is confirmed to strip any client-supplied value
    // before appending its own. Render's own community forum
    // (community.render.com, "Accessing client IPs in a Node/Express
    // app") confirms Render's reverse proxy does NOT strip incoming
    // X-Forwarded-For headers -- it only appends its own IP to whatever
    // the client already sent. Render's own DDoS-handling documentation
    // (render.com/articles/how-render-handles-ddos-attacks) independently
    // confirms the app sees the proxy's IP by default and that reading
    // x-forwarded-for is the documented way to get the real client IP --
    // it does not specify which position in the list to trust, which is
    // exactly the gap this method exists to close correctly.
    //
    // Concretely: an attacker can set X-Forwarded-For to any fake IP they
    // want; Render then appends its own real proxy IP after it, giving a
    // header like "X-Forwarded-For: <attacker's fake IP>, <Render's real
    // proxy IP>". Trusting the FIRST entry would read the attacker's
    // spoofed value straight out of position zero -- exactly what a rate
    // limiter must not do. Since Render appends exactly one hop and never
    // strips what's already there, the LAST entry in the list is always
    // the one Render itself observed and appended, which is the only
    // value in the header an external client cannot forge.
    //
    // Falls back to request.getRemoteAddr() (the raw socket-level
    // address) if the header is absent entirely, which covers local dev
    // (no proxy in front) and any direct-connection edge case.
    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor == null || forwardedFor.isBlank()) {
            return request.getRemoteAddr();
        }

        String[] parts = forwardedFor.split(",");
        return parts[parts.length - 1].trim();
    }
}