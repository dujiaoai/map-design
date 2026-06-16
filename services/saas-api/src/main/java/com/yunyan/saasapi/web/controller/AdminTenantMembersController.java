package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.application.admin.TenantMemberAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminUserDto;
import com.yunyan.saasapi.web.dto.admin.PatchUserRequest;
import com.yunyan.saasapi.web.dto.admin.TenantMemberListResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateMemberRolesRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/tenants/{tenantId}/members")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminTenantMembersController {

  private static final String PLATFORM_ADMIN_AUTHORITY = "ROLE_PLATFORM_ADMIN";

  private final TenantMemberAdminService tenantMemberAdminService;

  @GetMapping
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_READ
          + "') or hasAuthority('"
          + PLATFORM_ADMIN_AUTHORITY
          + "')")
  @Operation(
      summary = "列出租户成员",
      description =
          "TENANT_ADMIN 仅可访问 JWT 当前租户；PLATFORM_ADMIN 可跨租户；可选 q/status/sortBy/sortDir 筛选与排序")
  public TenantMemberListResponse listMembers(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String sortBy,
      @RequestParam(required = false) String sortDir) {
    return tenantMemberAdminService.listMembers(
        principal, tenantId, new AdminListParams(q, null, null, status, sortBy, sortDir));
  }

  @PatchMapping("/{userId}")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('"
          + PLATFORM_ADMIN_AUTHORITY
          + "')")
  @Operation(summary = "更新租户成员", description = "可修改 displayName、status（active/disabled）")
  public AdminUserDto patchMember(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID userId,
      @Valid @RequestBody PatchUserRequest request) {
    return tenantMemberAdminService.patchMember(principal, tenantId, userId, request);
  }

  @PutMapping("/{userId}/roles")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('"
          + PLATFORM_ADMIN_AUTHORITY
          + "')")
  @Operation(summary = "更新成员角色", description = "全量替换；仅 TENANT_ADMIN / MEMBER / VIEWER")
  public AdminUserDto updateMemberRoles(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID userId,
      @Valid @RequestBody UpdateMemberRolesRequest request) {
    return tenantMemberAdminService.updateMemberRoles(principal, tenantId, userId, request);
  }
}
