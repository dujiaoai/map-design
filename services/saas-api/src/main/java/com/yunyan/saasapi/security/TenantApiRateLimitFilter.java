package com.yunyan.saasapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.application.tenant.TenantApiRateLimitService;
import com.yunyan.saasapi.security.ratelimit.RateLimitException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** 对已认证 API 请求按租户 plan 的 apiRatePerMinute 限流。 */
@Component
public class TenantApiRateLimitFilter extends OncePerRequestFilter {

  private final TenantApiRateLimitService tenantApiRateLimitService;
  private final ObjectMapper objectMapper;

  public TenantApiRateLimitFilter(
      TenantApiRateLimitService tenantApiRateLimitService, ObjectMapper objectMapper) {
    this.tenantApiRateLimitService = tenantApiRateLimitService;
    this.objectMapper = objectMapper;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    var uri = request.getRequestURI();
    if (isExemptPath(uri, request.getMethod())) {
      return true;
    }
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof SaasPrincipal)) {
      return true;
    }
    return false;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    var principal = (SaasPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    var tenantId = principal.effectiveTenantId();
    try {
      tenantApiRateLimitService.check(tenantId);
    } catch (RateLimitException ex) {
      writeRateLimitProblem(response, ex);
      return;
    }
    filterChain.doFilter(request, response);
  }

  private static boolean isExemptPath(String uri, String method) {
    if (uri.startsWith("/actuator/health") || uri.startsWith("/actuator/info")) {
      return true;
    }
    if (uri.startsWith("/v3/api-docs") || uri.startsWith("/swagger-ui")) {
      return true;
    }
    if (HttpMethod.GET.matches(method) && "/v1/ping".equals(uri)) {
      return true;
    }
    if (uri.startsWith("/internal/")) {
      return true;
    }
    if (uri.startsWith("/v1/auth/")) {
      return true;
    }
    if (HttpMethod.GET.matches(method) && "/v1/admin/ping".equals(uri)) {
      return true;
    }
    return false;
  }

  private void writeRateLimitProblem(HttpServletResponse response, RateLimitException ex)
      throws IOException {
    var retryAfter = Math.max(1, ex.getRetryAfter().getSeconds());
    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
    response.setContentType("application/problem+json");
    objectMapper.writeValue(
        response.getOutputStream(),
        java.util.Map.of(
            "type", "https://api.yunyan.com/errors/rate-limit",
            "title", "Too many requests",
            "status", HttpStatus.TOO_MANY_REQUESTS.value(),
            "detail", ex.getMessage()));
  }
}
