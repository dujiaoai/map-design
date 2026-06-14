package com.yunyan.saasapi.web.dto.tenant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "租户摘要")
public record TenantSummaryDto(
    String id,
    String name,
    String slug,
    @Schema(description = "订阅计划", example = "free") String plan,
    @Schema(description = "租户类型", example = "organization") String kind,
    @Schema(description = "是否为当前 JWT 所在租户") boolean current) {}
