package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.TenantSamlAuthService;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.SamlAcsRequest;
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
@RequestMapping("/v1/auth/tenant-sso/saml")
@RequiredArgsConstructor
@Tag(name = "Auth Tenant SAML", description = "租户 SAML SP 授权流（Phase 11-1）")
public class AuthTenantSamlController {

  private final TenantSamlAuthService tenantSamlAuthService;

  @GetMapping("/{slug}/authorize")
  @Operation(summary = "开始租户 SAML 授权", description = "返回 IdP SSO redirect URL（HTTP-Redirect AuthnRequest）。")
  public OidcAuthorizeResponse authorize(@PathVariable String slug) {
    return tenantSamlAuthService.beginAuth(slug);
  }

  @PostMapping("/{slug}/acs")
  @Operation(summary = "SAML ACS 换票", description = "SPA 携带 SAMLResponse 换取 JWT 登录响应。")
  public LoginResponse acs(@PathVariable String slug, @Valid @RequestBody SamlAcsRequest request) {
    return tenantSamlAuthService.completeAcs(slug, request);
  }
}
