package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "平台后台 · SaaS 产品线")
public record AdminProductDto(
    @Schema(description = "产品 UUID") String id,
    @Schema(description = "产品 code", example = "map-design") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "描述") String description,
    @Schema(description = "状态", allowableValues = {"active", "inactive"}) String status,
    @Schema(description = "创建时间，毫秒 epoch") long createdAt) {}
