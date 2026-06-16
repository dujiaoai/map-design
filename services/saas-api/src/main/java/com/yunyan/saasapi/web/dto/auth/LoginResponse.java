package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "登录成功响应")
public record LoginResponse(
    @Schema(description = "JWT access token") String accessToken,
    @Schema(description = "JWT refresh token") String refreshToken,
    @Schema(description = "access token 有效秒数", example = "900") long expiresIn,
    LoginUserDto user,
    @Schema(description = "代操作时的登录主租户") SessionTenantDto homeTenant,
    @Schema(description = "为 true 时须调用 POST /v1/auth/login/mfa") Boolean mfaRequired,
    @Schema(description = "MFA step-up 短期 challenge token") String mfaChallengeToken) {}
