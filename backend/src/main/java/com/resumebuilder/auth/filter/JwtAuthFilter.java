package com.resumebuilder.auth.filter;

import com.resumebuilder.auth.service.JwtService;
import com.resumebuilder.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            userRepository.findByEmail(email).ifPresent(user -> {
                if (jwtService.isTokenValid(token, user)) {
                    // Extract the role claim from the JWT and set it as a
                    // GrantedAuthority so hasRole("ADMIN") / hasRole("USER")
                    // checks work correctly. Previously the auth token was
                    // created with an empty list, making every role check
                    // silently fail.
                    String role = jwtService.extractRole(token);
                    List<SimpleGrantedAuthority> authorities = (role != null)
                            ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            : List.of();

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            });
        }

        filterChain.doFilter(request, response);
    }
}