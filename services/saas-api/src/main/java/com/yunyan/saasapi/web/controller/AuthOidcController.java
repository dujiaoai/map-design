package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.OidcAuthService;
import com.yunyan.saasapi.application.auth.oidc.OidcClientKind;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.OidcCallbackRequest;
import com.yunyan.saasapi.web.dto.auth.OidcProvidersResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth/oidc")
@RequiredArgsConstructor
@Tag(name = "Auth OIDC", description = "OAuth2/OIDC 登录（ADR-0009）")
public class AuthOidcController {

  private final OidcAuthService oidcAuthService;

  @GetMapping("/providers")
  @Operation(
      summary = "OIDC 提供方摘要",
      description = "公开只读；enabled 且 provider 配齐 client-secret 时 authorizationCodeFlowAvailable 为 true。")
  public OidcProvidersResponse providers() {
    return oidcAuthService.getProviders();
  }

  @GetMapping("/{providerId}/authorize")
  @Operation(summary = "开始 OIDC 授权", description = "返回 IdP authorization URL（PKCE S256）。")
  public OidcAuthorizeResponse authorize(
      @PathVariable String providerId,
      @RequestParam(name = "client", defaultValue = "web") String client,
      @RequestParam(name = "tenantId") String tenantId) {
    try {
      return oidcAuthService.beginAuthorization(providerId, OidcClientKind.from(client), tenantId);
    } catch (IllegalArgumentException ex) {
      throw AuthException.badRequest(ex.getMessage());
    }
  }

  @PostMapping("/{providerId}/callback")
  @Operation(summary = "OIDC 回调换票", description = "SPA 携带 code/state 换取 JWT 登录响应。")
  public LoginResponse callback(
      @PathVariable String providerId, @Valid @RequestBody OidcCallbackRequest request) {
    return oidcAuthService.completeCallback(providerId, request);
  }
}
