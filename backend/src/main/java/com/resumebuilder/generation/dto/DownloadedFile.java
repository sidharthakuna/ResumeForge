package com.resumebuilder.generation.dto;

public record DownloadedFile(
        byte[] bytes,
        String fileName,
        String contentType
) {
}