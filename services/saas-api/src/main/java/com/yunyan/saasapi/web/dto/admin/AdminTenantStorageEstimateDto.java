package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminTenantStorageEstimateDto(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "估算附件字节数（骨架占位）") long attachmentBytes,
    @Schema(description = "估算地图图层字节数") long mapLayerBytes,
    @Schema(description = "合计字节数") long totalBytes,
    @Schema(description = "数据来源说明") String source) {}
