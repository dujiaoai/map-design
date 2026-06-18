package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminAuditWebhookArchiveRegionCount(
    @Schema(description = "区域标签") String region,
    @Schema(description = "归档批次数") long count) {}
