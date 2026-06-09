package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Token 对（登录或刷新）")
public record AuthTokensDto(
    String accessToken, String refreshToken, @Schema(example = "900") long expiresIn) {}
