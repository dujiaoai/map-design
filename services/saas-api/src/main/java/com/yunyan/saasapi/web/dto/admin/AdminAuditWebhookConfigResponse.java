package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminAuditWebhookConfigResponse(
    @Schema(description = "是否启用 Webhook 推送") boolean enabled,
    @Schema(description = "是否已配置 webhookUrl") boolean configured,
    @Schema(description = "推送格式：jsonl | ndjson") String format,
    @Schema(description = "当前交付模式：webhook | csv_only") String deliveryMode,
    @Schema(description = "待投递事件估算（游标之后）") long pendingEstimate,
    @Schema(description = "死信表记录数") long deadLetterCount,
    @Schema(description = "上次成功投递时间 epoch millis，可空") Long lastDeliveredAt,
    @Schema(description = "是否配置 HMAC 签名") boolean signatureEnabled) {}
