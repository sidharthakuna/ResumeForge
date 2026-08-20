package com.resumebuilder.user.controller;

import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.user.dto.response.UserProfileResponse;
import com.resumebuilder.user.service.ProfilePictureService;
import com.resumebuilder.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Dedicated controller for profile-picture operations.
 *
 * Separated from {@link UserController} to keep each controller focused on
 * a single concern. {@link UserController} handles plain profile data
 * (name, email, password); this one handles binary avatar uploads only.
 *
 * All endpoints are under {@code /api/users/me/avatar} and require
 * authentication (configured in {@link com.resumebuilder.config.SecurityConfig}).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;
    private final UserService userService;

    /**
     * Upload (or replace) the authenticated user's profile picture.
     *
     * Accepts {@code multipart/form-data} with a field named {@code file}.
     * Validates MIME type (JPEG/PNG/WebP/GIF) and size (≤ 5 MB) in the
     * service layer. Returns the updated profile so the frontend can
     * refresh the avatar URL in one round-trip.
     */
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponse>> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        profilePictureService.upload(file);
        // Return the full updated profile (with new profilePictureUrl).
        UserProfileResponse profile = userService.getProfile(request);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Remove the authenticated user's profile picture.
     * Returns the updated profile (profilePictureUrl will be null).
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserProfileResponse>> delete(HttpServletRequest request) {
        profilePictureService.delete();
        UserProfileResponse profile = userService.getProfile(request);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    /**
     * Serve a user's avatar image bytes.
     *
     * This endpoint is public so browsers can load it directly in an {@code <img>}
     * tag without needing Authorization headers. Returns 404 if no picture exists.
     * Cache-Control is intentionally short (60 s) so a freshly uploaded
     * photo is visible quickly without hammering the server.
     */
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> serve(@PathVariable java.util.UUID userId) {
        byte[] bytes = profilePictureService.getAvatarBytes(userId);
        if (bytes == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(profilePictureService.getAvatarContentType(userId)))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=60, must-revalidate")
                .body(bytes);
    }
}
