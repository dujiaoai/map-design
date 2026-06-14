package com.yunyan.billingapi.security;

import com.yunyan.billingapi.config.BillingAppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

public class InternalAuthFilter extends OncePerRequestFilter {

  public static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";

  private final BillingAppProperties billingAppProperties;

  public InternalAuthFilter(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
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
      response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "Internal billing API disabled");
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
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid internal token");
      return;
    }

    filterChain.doFilter(request, response);
  }
}
