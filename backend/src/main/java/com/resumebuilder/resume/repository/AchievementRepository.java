package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

    Optional<Achievement> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );
}