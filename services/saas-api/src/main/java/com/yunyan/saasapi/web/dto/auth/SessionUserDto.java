package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "当前登录用户")
public record SessionUserDto(
    @Schema(description = "用户 UUID") String id,
    @Schema(description = "邮箱", example = "admin@demo.local") String email,
    @Schema(description = "显示名", example = "Demo Admin") String name,
    @Schema(
            description = "角色码列表",
            example = "[\"TENANT_ADMIN\"]",
            allowableValues = {"PLATFORM_ADMIN", "TENANT_ADMIN", "MEMBER", "VIEWER"})
        List<String> roles,
    @Schema(
            description = "有效权限码（角色并集）",
            example = "[\"workspace:use\", \"workspace:map:read\"]")
        List<String> permissions) {}
