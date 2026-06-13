package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "确认注册邮箱验证")
public record RegisterConfirmRequest(
    @NotBlank @Schema(description = "邮件中的验证 token") String token) {}
