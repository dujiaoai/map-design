package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminAuditLogService;
import com.yunyan.saasapi.application.admin.AdminAuditWebhookArchiveSummaryService;
import com.yunyan.saasapi.application.admin.AdminAuditWebhookSelfHealStatusService;
import com.yunyan.saasapi.application.admin.AdminAuditWebhookTargetService;
import com.yunyan.saasapi.application.admin.AdminAuditWebhookDeadLetterService;
import com.yunyan.saasapi.application.admin.AdminAuditWebhookService;
import com.yunyan.saasapi.application.admin.AdminAuditWebhookSlaService;
import com.yunyan.saasapi.application.admin.AuditLogListParams;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminAuditLogListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditLogDto;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookConfigResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookTargetDto;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookTargetListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateAuditWebhookTargetRequest;
import com.yunyan.saasapi.web.dto.admin.PatchAuditWebhookTargetRequest;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookArchiveSummaryResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookSelfHealStatusResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookSlaResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookDeadLetterListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookDeadLetterReplayResponse;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
  private final AdminAuditWebhookService adminAuditWebhookService;
  private final AdminAuditWebhookSlaService adminAuditWebhookSlaService;
  private final AdminAuditWebhookDeadLetterService adminAuditWebhookDeadLetterService;
  private final AdminAuditWebhookTargetService adminAuditWebhookTargetService;
  private final AdminAuditWebhookSelfHealStatusService selfHealStatusService;
  private final AdminAuditWebhookArchiveSummaryService archiveSummaryService;

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

  @GetMapping("/{id}")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(summary = "单条审计日志", description = "按 ID 查询运营审计记录")
  public AdminAuditLogDto getAuditLog(@PathVariable UUID id) {
    return adminAuditLogService.getLog(id);
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

  @GetMapping("/webhook-sla")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(summary = "审计 Webhook 投递 SLA", description = "Phase 12-3：近 7 日成功率/延迟/死信")
  public AdminAuditWebhookSlaResponse webhookSla() {
    return adminAuditWebhookSlaService.getSlaSummary();
  }

  @GetMapping("/webhook-sla/self-heal-status")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(summary = "Webhook SLA 自愈状态", description = "Phase 15-3：降级目标与自愈候选")
  public AdminAuditWebhookSelfHealStatusResponse webhookSelfHealStatus() {
    return selfHealStatusService.getStatus();
  }

  @GetMapping("/webhook-archive-summary")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(summary = "Webhook 合规归档摘要", description = "Phase 16-3：按区域统计归档批次数")
  public AdminAuditWebhookArchiveSummaryResponse webhookArchiveSummary() {
    return archiveSummaryService.getSummary();
  }

  @GetMapping("/webhook-config")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(
      summary = "审计 Webhook/SIEM 配置摘要（只读）",
      description = "不含 webhook URL 明文；用于 Admin 合规集成状态展示。")
  public AdminAuditWebhookConfigResponse webhookConfig() {
    return adminAuditWebhookService.getConfig();
  }

  @GetMapping("/webhook-dead-letters")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(summary = "审计 Webhook 死信列表", description = "Phase 10-1：分页列出 delivery 失败的事件")
  public AdminAuditWebhookDeadLetterListResponse listWebhookDeadLetters(
      @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size) {
    return adminAuditWebhookDeadLetterService.list(page, size);
  }

  @PostMapping("/webhook-dead-letters/{id}/replay")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_EXPORT_AUTHORITIES)
  @Operation(summary = "重放 Webhook 死信", description = "POST payload 至配置的 webhook URL；成功则删除死信")
  public AdminAuditWebhookDeadLetterReplayResponse replayWebhookDeadLetter(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID id) {
    return adminAuditWebhookDeadLetterService.replay(principal, id);
  }

  @DeleteMapping("/webhook-dead-letters/{id}")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_EXPORT_AUTHORITIES)
  @Operation(summary = "删除 Webhook 死信", description = "丢弃无法投递的事件副本")
  public void deleteWebhookDeadLetter(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID id) {
    adminAuditWebhookDeadLetterService.delete(principal, id);
  }

  @GetMapping("/webhook-targets")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_READ_AUTHORITIES)
  @Operation(summary = "审计 Webhook 多目标列表", description = "Phase 13-3：除主 webhook 外的附加投递目标")
  public AdminAuditWebhookTargetListResponse listWebhookTargets() {
    return adminAuditWebhookTargetService.listTargets();
  }

  @PostMapping("/webhook-targets")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_EXPORT_AUTHORITIES)
  @Operation(summary = "创建 Webhook 投递目标")
  public AdminAuditWebhookTargetDto createWebhookTarget(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestBody @jakarta.validation.Valid CreateAuditWebhookTargetRequest request) {
    return adminAuditWebhookTargetService.createTarget(principal, request);
  }

  @PatchMapping("/webhook-targets/{id}")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_EXPORT_AUTHORITIES)
  @Operation(summary = "更新 Webhook 投递目标")
  public AdminAuditWebhookTargetDto patchWebhookTarget(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID id,
      @RequestBody PatchAuditWebhookTargetRequest request) {
    return adminAuditWebhookTargetService.patchTarget(principal, id, request);
  }

  @DeleteMapping("/webhook-targets/{id}")
  @PreAuthorize(PermissionCodes.ADMIN_AUDIT_EXPORT_AUTHORITIES)
  @Operation(summary = "删除 Webhook 投递目标")
  public void deleteWebhookTarget(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID id) {
    adminAuditWebhookTargetService.deleteTarget(principal, id);
  }
}
