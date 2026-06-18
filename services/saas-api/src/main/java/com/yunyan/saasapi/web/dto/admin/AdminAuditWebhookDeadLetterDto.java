package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminAuditWebhookDeadLetterDto(
    @Schema(description = "死信 ID") String id,
    @Schema(description = "关联审计日志 ID") String logId,
    @Schema(description = "重试次数") int attempts,
    @Schema(description = "最近一次错误摘要") String lastError,
    @Schema(description = "创建时间 epoch millis") long createdAt,
    @Schema(description = "更新时间 epoch millis") long updatedAt) {}
