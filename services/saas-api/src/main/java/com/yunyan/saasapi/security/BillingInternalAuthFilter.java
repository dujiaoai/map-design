package com.yunyan.saasapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.config.BillingApiProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/** Validates billing ↔ saas m2m token on {@code /internal/**} paths. */
public class BillingInternalAuthFilter extends OncePerRequestFilter {

  public static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";

  private final BillingApiProperties billingApiProperties;
  private final ObjectMapper objectMapper;

  public BillingInternalAuthFilter(
      BillingApiProperties billingApiProperties, ObjectMapper objectMapper) {
    this.billingApiProperties = billingApiProperties;
    this.objectMapper = objectMapper;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/internal/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    var expected = billingApiProperties.getInternalToken();
    if (!StringUtils.hasText(expected)) {
      writeProblem(response, HttpStatus.SERVICE_UNAVAILABLE, "Internal API disabled");
      return;
    }

    var token = request.getHeader(INTERNAL_TOKEN_HEADER);
    if (!StringUtils.hasText(token)) {
      var auth = request.getHeader(HttpHeaders.AUTHORIZATION);
      if (StringUtils.hasText(auth) && auth.startsWith("Bearer ")) {
        token = auth.substring(7).trim();
      }
    }

    if (!expected.equals(token)) {
      writeProblem(response, HttpStatus.UNAUTHORIZED, "Invalid internal token");
      return;
    }

    filterChain.doFilter(request, response);
  }

  private void writeProblem(HttpServletResponse response, HttpStatus status, String detail)
      throws IOException {
    response.setStatus(status.value());
    response.setContentType("application/problem+json");
    objectMapper.writeValue(
        response.getOutputStream(),
        java.util.Map.of(
            "type", "about:blank",
            "title", status.getReasonPhrase(),
            "status", status.value(),
            "detail", detail));
  }
}
