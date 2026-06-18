package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantDataExportArtifactResponse(
    @Schema(description = "导出请求 id") String requestId,
    @Schema(description = "artifact 下载 URL 或 skeleton 占位") String artifactUrl,
    @Schema(description = "是否可下载") boolean downloadable) {}
