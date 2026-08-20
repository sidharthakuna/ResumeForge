package com.resumebuilder.user.dto.request;

import jakarta.validation.constraints.Size;

/**
 * PATCH /api/users/me request.
 *
 * Both fields are optional (unlike RegisterRequest, which requires
 * everything) — this supports a partial update: change fullName only,
 * currentPassword+newPassword only, or both in one call. Validation on
 * newPassword only fires when it's actually present (see UserService),
 * since @Size alone can't express "required only if provided."
 *
 * currentPassword is required whenever newPassword is set — enforced in
 * UserService, not here, since it's a cross-field rule Bean Validation
 * on a record can't express cleanly without a class-level constraint.
 */
public record UpdateProfileRequest(
        String fullName,

        String currentPassword,

        @Size(min = 8, message = "Password must be at least 8 characters")
        String newPassword
) {
}