package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "当前会话（GET /v1/users/me）；对齐 @repo/auth Session")
public record SessionDto(
    @Schema(description = "当前用户（含 roles）") SessionUserDto user,
    @Schema(description = "当前有效租户（代操作时为 act_as 目标）") SessionTenantDto tenant,
    @Schema(description = "access token 过期时间，毫秒 epoch", example = "1710000900000")
        long expiresAt,
    @Schema(description = "代操作时的登录主租户；非代操作时为 null") SessionTenantDto homeTenant) {}
