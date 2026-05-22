package com.watchstore.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
public class HttpRequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (!request.getRequestURI().startsWith("/actuator")) {
                long durationMs = System.currentTimeMillis() - start;
                int status = response.getStatus();
                if (status >= 500) {
                    log.error("request completed method={} path={} status={} durationMs={}",
                            request.getMethod(), request.getRequestURI(), status, durationMs);
                } else if (status >= 400) {
                    log.warn("request completed method={} path={} status={} durationMs={}",
                            request.getMethod(), request.getRequestURI(), status, durationMs);
                } else {
                    log.info("request completed method={} path={} status={} durationMs={}",
                            request.getMethod(), request.getRequestURI(), status, durationMs);
                }
            }
        }
    }
}
