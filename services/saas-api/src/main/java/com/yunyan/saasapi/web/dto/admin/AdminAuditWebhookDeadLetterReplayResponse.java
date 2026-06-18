package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminAuditWebhookDeadLetterReplayResponse(
    @Schema(description = "死信 ID") String id,
    @Schema(description = "是否重放成功") boolean success,
    @Schema(description = "结果说明") String message) {}
