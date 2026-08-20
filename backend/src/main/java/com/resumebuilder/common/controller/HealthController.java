package com.resumebuilder.common.controller;

import com.resumebuilder.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        )));
    }
}
