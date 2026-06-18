package com.yunyan.saasapi.security;

import com.yunyan.saasapi.application.email.EmailTokenHasher;
import com.yunyan.saasapi.domain.ScimProvisioningTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class ScimBearerTokenAuthFilter extends OncePerRequestFilter {

  private final EmailTokenHasher emailTokenHasher;
  private final ScimProvisioningTokenRepository tokenRepository;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/scim/v2/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    var header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }
    var rawToken = header.substring("Bearer ".length()).trim();
    if (!StringUtils.hasText(rawToken)) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }
    var token =
        tokenRepository.findEnabledByTokenHash(emailTokenHasher.hash(rawToken)).orElse(null);
    if (token == null) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }
    request.setAttribute("scimTenantId", token.getTenantId());
    filterChain.doFilter(request, response);
  }
}
