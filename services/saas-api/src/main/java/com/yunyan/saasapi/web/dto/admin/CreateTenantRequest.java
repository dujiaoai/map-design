package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "创建租户")
public record CreateTenantRequest(
    @NotBlank @Size(max = 128) @Schema(description = "显示名", example = "Acme Corp") String name,
    @NotBlank
        @Size(max = 64)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "slug must be lowercase alphanumeric with optional hyphens")
        @Schema(description = "唯一 slug", example = "acme")
        String slug,
    @Size(max = 32) @Schema(description = "订阅计划，默认 free", example = "free") String plan,
    @Schema(description = "试用结束时间，毫秒 epoch") Long trialEndsAt) {}
