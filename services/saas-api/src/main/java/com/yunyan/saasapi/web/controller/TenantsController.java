package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.tenant.TenantQuotaService;
import com.yunyan.saasapi.application.tenant.TenantService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.tenant.TenantFeaturesResponse;
import com.yunyan.saasapi.web.dto.tenant.TenantListResponse;
import com.yunyan.saasapi.web.dto.tenant.TenantQuotasResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants")
@SecurityRequirement(name = "bearerAuth")
public class TenantsController {

  private final TenantService tenantService;
  private final TenantQuotaService tenantQuotaService;

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

  @GetMapping("/{tenantId}/features")
  @Operation(
      summary = "获取租户已开通能力码",
      description = "返回 `tenantFeature` 能力码列表，供前端 `filterNavByTenant` 门控。仅可查询当前用户可访问的租户。")
  @ApiResponse(responseCode = "200", description = "能力码列表")
  @ApiResponse(
      responseCode = "403",
      description = "无权访问该租户",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "404",
      description = "租户不存在",
      content = @Content(mediaType = "application/problem+json"))
  public TenantFeaturesResponse features(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Parameter(description = "租户 UUID") @PathVariable UUID tenantId) {
    return tenantService.getFeatures(principal, tenantId);
  }

  @GetMapping("/{tenantId}/quotas")
  @Operation(
      summary = "获取租户 Plan 配额与用量",
      description = "返回 seat / API rate / storage 上限与当前 seat 占用；仅可查询可访问租户。")
  @ApiResponse(responseCode = "200", description = "配额摘要")
  @ApiResponse(
      responseCode = "403",
      description = "无权访问该租户",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "404",
      description = "租户不存在",
      content = @Content(mediaType = "application/problem+json"))
  public TenantQuotasResponse quotas(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Parameter(description = "租户 UUID") @PathVariable UUID tenantId) {
    return tenantQuotaService.getQuotas(principal, tenantId);
  }
}
