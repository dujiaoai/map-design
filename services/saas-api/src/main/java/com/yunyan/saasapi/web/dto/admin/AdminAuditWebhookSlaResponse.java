package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminAuditWebhookSlaResponse(
    @Schema(description = "统计窗口天数") int windowDays,
    @Schema(description = "投递成功率（0-100）") double deliveryRatePercent,
    @Schema(description = "平均投递耗时 ms") double avgLatencyMs,
    @Schema(description = "待重试死信数") long pendingDeadLetters,
    @Schema(description = "死信总数") long deadLetterCount) {}
