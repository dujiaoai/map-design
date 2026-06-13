package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.TenantInviteLinkAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreateTenantInviteLinkRequest;
import com.yunyan.saasapi.web.dto.admin.CreateTenantInviteLinkResponse;
import com.yunyan.saasapi.web.dto.admin.TenantInviteLinkDto;
import com.yunyan.saasapi.web.dto.admin.TenantInviteLinkListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/tenants/{tenantId}/invite-links")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminTenantInviteLinksController {

  private static final String PLATFORM_ADMIN_AUTHORITY = "ROLE_PLATFORM_ADMIN";

  private final TenantInviteLinkAdminService tenantInviteLinkAdminService;

  @GetMapping
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_READ
          + "') or hasAuthority('"
          + PLATFORM_ADMIN_AUTHORITY
          + "')")
  @Operation(summary = "列出租户邀请链接")
  public TenantInviteLinkListResponse listInviteLinks(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantInviteLinkAdminService.listLinks(principal, tenantId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('"
          + PLATFORM_ADMIN_AUTHORITY
          + "')")
  @Operation(
      summary = "创建邀请链接",
      description = "返回完整 inviteUrl，仅此次响应包含 token，请立即复制保存")
  public CreateTenantInviteLinkResponse createInviteLink(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody CreateTenantInviteLinkRequest request) {
    return tenantInviteLinkAdminService.createLink(principal, tenantId, request);
  }

  @DeleteMapping("/{linkId}")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('"
          + PLATFORM_ADMIN_AUTHORITY
          + "')")
  @Operation(summary = "撤销邀请链接")
  public TenantInviteLinkDto revokeInviteLink(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID linkId) {
    return tenantInviteLinkAdminService.revokeLink(principal, tenantId, linkId);
  }
}
