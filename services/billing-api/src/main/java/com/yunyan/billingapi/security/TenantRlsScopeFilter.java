package com.yunyan.billingapi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Enables RLS bypass for trusted cross-tenant entry points (internal m2m, platform admin, webhooks).
 */
public class TenantRlsScopeFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    if (requiresBypass(request.getRequestURI())) {
      TenantRlsBypass.runThrowing(() -> filterChain.doFilter(request, response));
      return;
    }
    filterChain.doFilter(request, response);
  }

  private static boolean requiresBypass(String uri) {
    return uri.startsWith("/internal/")
        || uri.startsWith("/v1/admin/billing/")
        || uri.startsWith("/v1/billing/webhooks/");
  }
}
