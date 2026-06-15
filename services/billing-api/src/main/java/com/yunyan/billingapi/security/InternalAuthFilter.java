package com.yunyan.billingapi.security;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

public class InternalAuthFilter extends OncePerRequestFilter {

  public static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";
  public static final String CALLER_SERVICE_HEADER = "X-Billing-Caller-Service";

  private final BillingAppProperties billingAppProperties;
  private final ObjectMapper objectMapper;

  public InternalAuthFilter(
      BillingAppProperties billingAppProperties, ObjectMapper objectMapper) {
    this.billingAppProperties = billingAppProperties;
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
    var expected = billingAppProperties.getInternal().getToken();
    if (!StringUtils.hasText(expected)) {
      SecurityProblemWriter.write(
          response,
          objectMapper,
          HttpStatus.SERVICE_UNAVAILABLE,
          "Internal billing API disabled",
          "Service unavailable");
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
      SecurityProblemWriter.write(
          response,
          objectMapper,
          HttpStatus.UNAUTHORIZED,
          "Invalid internal token",
          "Unauthorized");
      return;
    }

    if (!InternalCallerValidator.isCallerAllowed(
        billingAppProperties, request.getHeader(CALLER_SERVICE_HEADER))) {
      SecurityProblemWriter.write(
          response,
          objectMapper,
          HttpStatus.FORBIDDEN,
          "Caller service is not allowed",
          "Forbidden");
      return;
    }

    filterChain.doFilter(request, response);
  }
}
