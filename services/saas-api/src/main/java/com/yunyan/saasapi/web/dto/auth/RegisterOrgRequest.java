package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "自助创建组织并注册首个管理员")
public record RegisterOrgRequest(
    @Schema(description = "组织显示名", example = "云眼测绘") @NotBlank @Size(max = 128) String orgName,
    @Schema(
            description = "组织唯一标识（slug）；省略时由 orgName 自动生成",
            example = "yunyan-survey")
        @Size(max = 64)
        String slug,
    @Schema(description = "管理员邮箱", example = "owner@example.com")
        @NotBlank
        @Email
        String email,
    @Schema(description = "明文密码（至少 8 位）", example = "Password1") @NotBlank @Size(min = 8)
        String password,
    @Schema(description = "显示名；省略时取邮箱 @ 前部分", example = "张三") @Size(max = 128)
        String displayName) {}
