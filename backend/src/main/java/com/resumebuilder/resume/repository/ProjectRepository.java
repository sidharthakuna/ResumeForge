package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findByIdAndResumeUserId(
            UUID id,
            UUID userId
    );
}