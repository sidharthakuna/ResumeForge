package com.resumebuilder.auth.service;

import com.resumebuilder.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        try {
            return extractAllClaims(token).getSubject();
        } catch (JwtException e) {
            return null;
        }
    }

    public boolean isTokenValid(String token, User user) {
        try {
            Claims claims = extractAllClaims(token);
            String email = claims.getSubject();
            boolean notExpired = claims.getExpiration().after(new Date());
            return email.equals(user.getEmail()) && notExpired;
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Extracts the role claim from a validated token. Returns null if the
     * claim is absent or the token is malformed — callers should treat null
     * as "no role" rather than propagating it.
     */
    public String extractRole(String token) {
        try {
            return extractAllClaims(token).get("role", String.class);
        } catch (JwtException e) {
            return null;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}