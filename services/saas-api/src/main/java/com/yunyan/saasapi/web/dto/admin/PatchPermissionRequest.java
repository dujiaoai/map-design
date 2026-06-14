package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "更新权限项元数据")
public record PatchPermissionRequest(
    @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 255) @Schema(description = "说明") String description) {}
