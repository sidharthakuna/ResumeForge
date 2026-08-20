package com.resumebuilder.common.security;

import com.resumebuilder.common.exception.UnauthenticatedException;
import com.resumebuilder.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationFacade {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            throw new UnauthenticatedException("No authentication found in security context.");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof User user)) {
            throw new UnauthenticatedException("Current principal is not an authenticated user.");
        }

        return user;
    }
}