package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminAuditLogService;
import com.yunyan.saasapi.application.admin.AuditLogListParams;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminAuditLogListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(
      summary = "运营审计日志",
      description = "记录成员管理写操作，含跨租户标记；可选 q/page/size 分页")
  public AdminAuditLogListResponse listAuditLogs(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) Boolean crossTenant,
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) Long from,
      @RequestParam(required = false) Long to,
      @RequestParam(required = false) UUID actorUserId,
      @RequestParam(required = false) String sortBy,
      @RequestParam(required = false) String sortDir) {
    return adminAuditLogService.listLogs(
        new AuditLogListParams(
            q, page, size, action, crossTenant, tenantId, from, to, actorUserId, sortBy, sortDir));
  }

  @GetMapping(value = "/export", produces = "text/csv")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_EXPORT_AUTHORITIES)
  @Operation(
      summary = "导出审计日志 CSV",
      description =
          "与列表相同筛选条件；最多导出 "
              + AdminAuditLogService.EXPORT_MAX_ROWS
              + " 条，按 created_at 倒序；写入 audit.export 审计")
  public ResponseEntity<byte[]> exportAuditLogs(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) Boolean crossTenant,
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) Long from,
      @RequestParam(required = false) Long to,
      @RequestParam(required = false) UUID actorUserId) {
    var params =
        new AuditLogListParams(q, null, null, action, crossTenant, tenantId, from, to, actorUserId);
    var csv = adminAuditLogService.exportCsv(principal, params);
    var filename = "audit-logs-" + Instant.now().toString().substring(0, 10) + ".csv";
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
        .body(csv);
  }
}
