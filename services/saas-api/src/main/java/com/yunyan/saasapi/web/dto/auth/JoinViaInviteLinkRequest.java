package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "通过邀请链接加入租户")
public record JoinViaInviteLinkRequest(
    @NotBlank @Schema(description = "邀请链接 token") String token,
    @NotBlank @Email @Schema(description = "注册邮箱") String email,
    @NotBlank @Size(min = 8) @Schema(description = "登录密码") String password,
    @Size(max = 128) @Schema(description = "显示名；省略时取邮箱 @ 前部分") String displayName) {}
