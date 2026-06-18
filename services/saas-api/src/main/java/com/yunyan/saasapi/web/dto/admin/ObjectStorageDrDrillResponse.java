package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record ObjectStorageDrDrillResponse(
    @Schema(description = "success|failed|skipped") String status,
    @Schema(description = "详情") String detail,
    @Schema(description = "执行时间 epoch millis") long executedAt) {}
