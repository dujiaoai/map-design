package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Token 对（登录或刷新）")
public record AuthTokensDto(
    @Schema(description = "JWT access token") String accessToken,
    @Schema(description = "JWT refresh token") String refreshToken,
    @Schema(description = "access token 有效秒数", example = "900") long expiresIn) {}
