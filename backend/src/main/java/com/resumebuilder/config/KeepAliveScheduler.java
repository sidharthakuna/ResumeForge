package com.resumebuilder.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Slf4j
@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "keepalive.enabled", havingValue = "true")
public class KeepAliveScheduler {

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // Runs every 12 minutes (720,000 ms), starting 1 minute after boot
    @Scheduled(fixedRate = 720000, initialDelay = 60000)
    public void pingSelf() {
        if (renderExternalUrl == null || renderExternalUrl.isBlank()) {
            log.debug("Keep-alive self-ping skipped: RENDER_EXTERNAL_URL is not set.");
            return;
        }

        try {
            String targetUrl = renderExternalUrl.replaceAll("/$", "") + "/api/health";
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .GET()
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Keep-alive self-ping succeeded [{}]: status code {}", targetUrl, response.statusCode());
        } catch (Exception e) {
            log.warn("Keep-alive self-ping warning: {}", e.getMessage());
        }
    }
}
