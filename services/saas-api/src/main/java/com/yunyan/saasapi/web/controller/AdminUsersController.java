package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.application.admin.UserAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.web.dto.admin.AdminUserDto;
import com.yunyan.saasapi.web.dto.admin.AdminUserListResponse;
import com.yunyan.saasapi.web.dto.admin.PatchUserRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminUsersController {

  private final UserAdminService userAdminService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_USERS_READ + "')")
  @Operation(
      summary = "列出用户",
      description = "可选 tenantId、status 过滤；q/page/size 分页搜索（无分页参数时返回全量）")
  public AdminUserListResponse listUsers(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size) {
    return userAdminService.listUsers(
        Optional.ofNullable(tenantId), new AdminListParams(q, page, size, status));
  }

  @PatchMapping("/{userId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_USERS_WRITE + "')")
  @Operation(summary = "更新用户", description = "可修改 displayName、status（active/disabled）")
  public AdminUserDto patchUser(
      @PathVariable UUID userId, @Valid @RequestBody PatchUserRequest request) {
    return userAdminService.patchUser(userId, request);
  }
}
