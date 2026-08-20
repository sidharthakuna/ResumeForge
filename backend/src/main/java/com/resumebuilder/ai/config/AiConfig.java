package com.resumebuilder.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class AiConfig {

    @Bean
    public RestClient geminiRestClient(AiProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(properties.getGemini().getTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(properties.getGemini().getTimeoutMs()));

        return RestClient.builder()
                .baseUrl(properties.getGemini().getBaseUrl())
                .requestFactory(new BufferingClientHttpRequestFactory(factory))
                .build();
    }
}
