package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.TenantSsoAuthService;
import com.yunyan.saasapi.application.auth.TenantSsoOidcAuthService;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.OidcCallbackRequest;
import com.yunyan.saasapi.web.dto.auth.TenantSsoPublicResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth/tenants")
@RequiredArgsConstructor
@Tag(name = "Auth Tenant SSO", description = "租户级 SSO 登录入口（Phase 7-1 / 8-1）")
public class AuthTenantsController {

  private final TenantSsoAuthService tenantSsoAuthService;
  private final TenantSsoOidcAuthService tenantSsoOidcAuthService;

  @GetMapping("/{slug}/sso")
  @Operation(
      summary = "租户 SSO 公开摘要",
      description = "登录页按 slug 探测是否展示企业 SSO 按钮；不含 client_secret。")
  public TenantSsoPublicResponse tenantSso(@PathVariable String slug) {
    return tenantSsoAuthService.getPublicSsoBySlug(slug);
  }

  @GetMapping("/{slug}/sso/authorize")
  @Operation(summary = "开始租户 SSO 授权", description = "返回租户 IdP authorization URL（PKCE S256）。")
  public OidcAuthorizeResponse tenantSsoAuthorize(@PathVariable String slug) {
    return tenantSsoOidcAuthService.beginAuthorization(slug);
  }

  @PostMapping("/{slug}/sso/callback")
  @Operation(summary = "租户 SSO 回调换票", description = "SPA 携带 code/state 换取 JWT 登录响应。")
  public LoginResponse tenantSsoCallback(
      @PathVariable String slug, @Valid @RequestBody OidcCallbackRequest request) {
    return tenantSsoOidcAuthService.completeCallback(slug, request);
  }
}
