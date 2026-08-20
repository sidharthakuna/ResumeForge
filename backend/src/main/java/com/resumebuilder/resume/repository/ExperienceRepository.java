package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExperienceRepository extends JpaRepository<Experience, UUID> {

    Optional<Experience> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );
}