package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.OidcAuthService;
import com.yunyan.saasapi.web.dto.auth.OidcProvidersResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth/oidc")
@RequiredArgsConstructor
@Tag(name = "Auth OIDC", description = "OAuth2/OIDC 登录发现（ADR-0009）")
public class AuthOidcController {

  private final OidcAuthService oidcAuthService;

  @GetMapping("/providers")
  @Operation(
      summary = "OIDC 提供方摘要",
      description = "公开只读；骨架期 authorizationCodeFlowAvailable 恒为 false。")
  public OidcProvidersResponse providers() {
    return oidcAuthService.getProviders();
  }
}
