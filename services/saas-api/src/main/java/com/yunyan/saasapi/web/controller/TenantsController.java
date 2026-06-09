package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.tenant.TenantService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.tenant.TenantListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants")
@SecurityRequirement(name = "bearerAuth")
public class TenantsController {

  private final TenantService tenantService;

  @GetMapping
  @Operation(
      summary = "列出当前用户可访问的租户",
      description = "按登录邮箱汇总各租户成员身份；`current=true` 对应当前 JWT 租户。PLATFORM_ADMIN 可见全部租户。")
  @ApiResponse(responseCode = "200", description = "租户列表")
  @ApiResponse(
      responseCode = "401",
      description = "未认证",
      content = @Content(mediaType = "application/problem+json"))
  public TenantListResponse list(@AuthenticationPrincipal SaasPrincipal principal) {
    return tenantService.listAccessible(principal);
  }
}
