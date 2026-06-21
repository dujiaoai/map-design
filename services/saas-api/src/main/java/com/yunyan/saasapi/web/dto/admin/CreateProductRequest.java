package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "创建 SaaS 产品线")
public record CreateProductRequest(
    @NotBlank
        @Size(max = 64)
        @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "code must be lowercase alphanumeric with optional hyphens")
        @Schema(description = "唯一产品码", example = "uav-cloud")
        String code,
    @NotBlank @Size(max = 128) @Schema(description = "显示名", example = "机库云") String name,
    @Size(max = 512) @Schema(description = "说明") String description) {}
