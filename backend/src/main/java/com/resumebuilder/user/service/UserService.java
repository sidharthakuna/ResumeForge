package com.resumebuilder.user.service;

import com.resumebuilder.common.exception.InvalidCredentialsException;
import com.resumebuilder.common.security.AuthenticationFacade;
import com.resumebuilder.user.dto.request.UpdateProfileRequest;
import com.resumebuilder.user.dto.response.UserProfileResponse;
import com.resumebuilder.user.entity.User;
import com.resumebuilder.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthenticationFacade authenticationFacade;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile() {
        User currentUser = authenticationFacade.getCurrentUser();
        HttpServletRequest request = currentRequest();
        return toResponse(currentUser, request);
    }

    public UserProfileResponse getProfile(HttpServletRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();
        return toResponse(currentUser, request);
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User currentUser = authenticationFacade.getCurrentUser();

        if (request.fullName() != null && !request.fullName().isBlank()) {
            currentUser.setFullName(request.fullName());
        }

        // A newPassword being present is what triggers the password-change
        // path at all -- currentPassword is deliberately NOT required just
        // to update fullName, only when actually changing the password.
        if (request.newPassword() != null && !request.newPassword().isBlank()) {

            // Requiring currentPassword here isn't just polite confirmation:
            // without it, a stolen/leaked JWT alone (e.g. via XSS, a shared
            // machine) would be enough to permanently lock the real account
            // owner out by silently changing their password. Re-checking the
            // current password means token theft alone isn't sufficient for
            // account takeover.
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new InvalidCredentialsException(
                        "Current password is required to set a new password");
            }

            if (!passwordEncoder.matches(request.currentPassword(), currentUser.getPassword())) {
                throw new InvalidCredentialsException("Current password is incorrect");
            }

            currentUser.setPassword(passwordEncoder.encode(request.newPassword()));
        }

        User saved = userRepository.save(currentUser);
        return toResponse(saved, currentRequest());
    }

    private UserProfileResponse toResponse(User user, HttpServletRequest request) {
        String avatarUrl = null;
        if (user.getProfilePicturePath() != null) {
            avatarUrl = request != null
                    ? ProfilePictureService.buildAvatarUrl(request, user.getId())
                    : null;
        }
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                avatarUrl
        );
    }

    /** Resolves the current HTTP request from Spring's RequestContextHolder. */
    private HttpServletRequest currentRequest() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }
}