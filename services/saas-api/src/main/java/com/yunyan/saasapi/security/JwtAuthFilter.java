package com.yunyan.saasapi.security;

import com.yunyan.saasapi.application.permission.PermissionResolver;
import com.fasterxml.jackson.databind.ObjectMapper;
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
  private final PermissionResolver permissionResolver;
  private final AccessTokenDenylist accessTokenDenylist;
  private final ObjectMapper objectMapper;

  public JwtAuthFilter(
      JwtService jwtService,
      PermissionResolver permissionResolver,
      AccessTokenDenylist accessTokenDenylist,
      ObjectMapper objectMapper) {
    this.jwtService = jwtService;
    this.permissionResolver = permissionResolver;
    this.accessTokenDenylist = accessTokenDenylist;
    this.objectMapper = objectMapper;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    try {
      var bearer = resolveBearerToken(request);
      if (bearer.isPresent()) {
        try {
          authenticate(request, bearer.get());
        } catch (PermEpochStaleException ex) {
          PermEpochProblemWriter.write(response, objectMapper);
          return;
        }
      }
      filterChain.doFilter(request, response);
    } finally {
      TenantContext.clear();
    }
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
      TenantContext.set(parsed.tenantId().toString());

      var permissionCodes = resolvePermissionCodes(parsed.permissionCodes(), parsed.roleCodes());
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
      // 无效/过期/非 access token — 视为未认证，由 Security 返回 401
    }
  }

  private java.util.List<String> resolvePermissionCodes(
      java.util.List<String> tokenPermissions, java.util.List<String> roleCodes) {
    if (tokenPermissions != null && !tokenPermissions.isEmpty()) {
      return tokenPermissions;
    }
    return permissionResolver.resolveByRoleCodes(roleCodes);
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
