package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "通过邮箱邀请租户成员")
public record InviteMemberByEmailRequest(
    @NotBlank @Email @Schema(description = "受邀邮箱", example = "member@example.com") String email,
    @Size(max = 128) @Schema(description = "显示名（可选）") String displayName,
    @Schema(description = "角色码，默认 MEMBER", example = "MEMBER") String roleCode) {}
