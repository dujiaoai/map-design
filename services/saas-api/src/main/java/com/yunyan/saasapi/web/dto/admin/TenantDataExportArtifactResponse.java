package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantDataExportArtifactResponse(
    @Schema(description = "导出请求 id") String requestId,
    @Schema(description = "artifact 下载 URL") String artifactUrl,
    @Schema(description = "对象存储 key") String artifactObjectKey,
    @Schema(description = "是否可下载") boolean downloadable) {}
