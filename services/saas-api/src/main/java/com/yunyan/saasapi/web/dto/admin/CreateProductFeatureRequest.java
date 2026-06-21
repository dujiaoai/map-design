package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "为产品线注册 tenantFeature 能力码")
public record CreateProductFeatureRequest(
    @NotBlank
        @Size(max = 128)
        @Pattern(
            regexp = "^[a-z][a-z0-9_.-]*$",
            message = "code must start with a letter and contain lowercase letters, digits, dots, hyphens, or underscores")
        @Schema(description = "能力码", example = "uav.dock-monitor")
        String code,
    @NotBlank @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 512) @Schema(description = "说明") String description) {}
