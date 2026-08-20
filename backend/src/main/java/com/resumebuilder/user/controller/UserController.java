package com.resumebuilder.user.controller;

import com.resumebuilder.common.response.ApiResponse;
import com.resumebuilder.user.dto.request.UpdateProfileRequest;
import com.resumebuilder.user.dto.response.UserProfileResponse;
import com.resumebuilder.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Deliberately scoped to /me only -- no /api/users/{id} lookup of other
// users, and no admin-facing user list/management here. This endpoint is
// "view and edit my own account," nothing broader. Email is intentionally
// not editable via this endpoint -- see UpdateProfileRequest's javadoc.
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile() {
        UserProfileResponse response = userService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}