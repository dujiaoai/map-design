package com.yunyan.saasapi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      resolveBearerToken(request).ifPresent(token -> authenticate(request, token));
      filterChain.doFilter(request, response);
    } finally {
      TenantContext.clear();
    }
  }

  private void authenticate(HttpServletRequest request, String token) {
    try {
      var parsed = jwtService.parseAccessToken(token);
      TenantContext.set(parsed.tenantId().toString());

      var principal = new SaasPrincipal(
          parsed.userId(),
          parsed.tenantId(),
          parsed.userId().toString(),
          parsed.roleCodes(),
          parsed.expiresAt());

      var authentication = new UsernamePasswordAuthenticationToken(
          principal, null, principal.getAuthorities());
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (AuthException ignored) {
      // 无效/过期/非 access token — 视为未认证，由 Security 返回 401
    }
  }

  private java.util.Optional<String> resolveBearerToken(HttpServletRequest request) {
    var header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
      return java.util.Optional.empty();
    }
    var token = header.substring(7).trim();
    return StringUtils.hasText(token) ? java.util.Optional.of(token) : java.util.Optional.empty();
  }
}
