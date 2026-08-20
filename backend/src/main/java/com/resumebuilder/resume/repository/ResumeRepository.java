package com.resumebuilder.resume.repository;

import com.resumebuilder.resume.entity.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    List<Resume> findByUserId(UUID userId);

    Page<Resume> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph("Resume.withDetails")
    Optional<Resume> findById(UUID id);

    @Query("SELECT r FROM Resume r " +
            "LEFT JOIN FETCH r.personalInfo " +
            "LEFT JOIN FETCH r.educationList " +
            "WHERE r.id = :id AND r.user.id = :userId")
    Optional<Resume> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT r FROM Resume r " +
            "LEFT JOIN FETCH r.personalInfo " +
            "WHERE r.id = :id AND r.user.id = :userId")
    Optional<Resume> findFullByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}