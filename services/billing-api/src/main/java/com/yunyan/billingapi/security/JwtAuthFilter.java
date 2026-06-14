package com.yunyan.billingapi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
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
  private final AccessTokenDenylist accessTokenDenylist;

  public JwtAuthFilter(JwtService jwtService, AccessTokenDenylist accessTokenDenylist) {
    this.jwtService = jwtService;
    this.accessTokenDenylist = accessTokenDenylist;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    resolveBearerToken(request).ifPresent(token -> authenticate(request, token));
    filterChain.doFilter(request, response);
  }

  private void authenticate(HttpServletRequest request, String token) {
    try {
      var parsed = jwtService.parseAccessToken(token);
      if (parsed.jti() != null && accessTokenDenylist.isDenied(parsed.jti())) {
        return;
      }
      if (accessTokenDenylist.isUserDenied(parsed.userId())) {
        return;
      }

      var permissionCodes =
          parsed.permissionCodes() != null ? parsed.permissionCodes() : List.<String>of();
      var principal = new SaasPrincipal(
          parsed.userId(),
          parsed.tenantId(),
          parsed.userId().toString(),
          parsed.roleCodes(),
          permissionCodes,
          parsed.jti(),
          parsed.expiresAt());

      var authentication = new UsernamePasswordAuthenticationToken(
          principal, null, principal.getAuthorities());
      authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (AuthException ignored) {
      // 无效/过期 token — 视为未认证
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
