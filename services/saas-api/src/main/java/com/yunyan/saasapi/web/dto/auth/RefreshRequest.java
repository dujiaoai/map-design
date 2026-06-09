package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "刷新 token 请求")
public record RefreshRequest(
    @Schema(description = "登录或上次刷新返回的 refresh token") @NotBlank String refreshToken) {}
