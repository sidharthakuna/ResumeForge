package com.resumebuilder.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Logs every HTTP request with a unique request ID, method, URI, response
 * status, and duration in milliseconds. The request ID is also placed into
 * SLF4J's MDC so that any log line emitted during that request's processing
 * automatically includes it — invaluable for correlating logs in production
 * when multiple requests are interleaved.
 *
 * Runs at the very top of the filter chain (Ordered.HIGHEST_PRECEDENCE + 10,
 * after Spring's own internal filters but before Security and JwtAuthFilter)
 * so the timing measurement covers the full request lifecycle including
 * authentication.
 *
 * Example log line:
 *   [req-abc123] POST /api/auth/login -> 200 (42ms)
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String MDC_REQUEST_ID = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put(MDC_REQUEST_ID, requestId);

        long start = System.currentTimeMillis();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            log.info("[req-{}] {} {} -> {} ({}ms)",
                    requestId,
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration);
            MDC.remove(MDC_REQUEST_ID);
        }
    }
}
