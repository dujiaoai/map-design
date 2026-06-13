package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminAuditLogService;
import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.web.dto.admin.AdminAuditLogListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminAuditLogsController {

  private final AdminAuditLogService adminAuditLogService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(
      summary = "运营审计日志",
      description = "记录成员管理写操作，含跨租户标记；可选 q/page/size 分页")
  public AdminAuditLogListResponse listAuditLogs(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size) {
    return adminAuditLogService.listLogs(new AdminListParams(q, page, size));
  }
}
