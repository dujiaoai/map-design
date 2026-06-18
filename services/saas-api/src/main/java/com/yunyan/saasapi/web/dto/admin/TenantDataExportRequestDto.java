package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantDataExportRequestDto(
    @Schema(description = "请求 ID") String id,
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "pending | processing | completed | failed") String status,
    @Schema(description = "发起人 userId") String requestedByUserId,
    @Schema(description = "导出包 URL（完成后）") String artifactUrl,
    @Schema(description = "创建时间 epoch ms") Long createdAt,
    @Schema(description = "完成时间 epoch ms") Long completedAt) {}
