package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.TenantSsoAuthService;
import com.yunyan.saasapi.web.dto.auth.TenantSsoPublicResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth/tenants")
@RequiredArgsConstructor
@Tag(name = "Auth Tenant SSO", description = "租户级 SSO 登录入口（Phase 7-1）")
public class AuthTenantsController {

  private final TenantSsoAuthService tenantSsoAuthService;

  @GetMapping("/{slug}/sso")
  @Operation(
      summary = "租户 SSO 公开摘要",
      description = "登录页按 slug 探测是否展示企业 SSO 按钮；不含 client_secret。")
  public TenantSsoPublicResponse tenantSso(@PathVariable String slug) {
    return tenantSsoAuthService.getPublicSsoBySlug(slug);
  }
}
