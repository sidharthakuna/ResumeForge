package com.resumebuilder.user.dto.response;

import com.resumebuilder.user.enums.Role;

import java.util.UUID;

/**
 * GET /api/users/me response.
 *
 * Deliberately excludes the password field (even the bcrypt hash) — a
 * response DTO should never carry credential material, regardless of
 * whether the hash itself is safe to expose. Keeping the DTO's shape
 * unable to hold a password is a stronger guarantee than "remembering
 * not to serialize it" at each call site.
 *
 * profilePictureUrl is a fully-qualified URL (e.g. http://localhost:9090/api/users/me/avatar)
 * or null when no photo has been uploaded yet.
 */
public record UserProfileResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        String profilePictureUrl
) {
}