package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "当前会话（GET /v1/users/me）")
public record SessionDto(
    SessionUserDto user,
    SessionTenantDto tenant,
    @Schema(description = "access token 过期时间，毫秒 epoch") long expiresAt) {}
