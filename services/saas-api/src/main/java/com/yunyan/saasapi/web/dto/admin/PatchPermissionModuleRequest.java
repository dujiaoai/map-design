package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "更新权限模块元数据")
public record PatchPermissionModuleRequest(
    @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 255) @Schema(description = "说明") String description,
    @Pattern(regexp = "platform|tenant|workspace") @Schema(description = "作用域") String scope,
    @Schema(description = "排序") Integer sortOrder) {}
