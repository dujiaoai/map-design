package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "更新用户（部分字段）")
public record PatchUserRequest(
    @Size(max = 128) @Schema(description = "显示名") String displayName,
    @Pattern(regexp = "active|disabled", message = "status must be active or disabled")
        @Schema(description = "账号状态", allowableValues = {"active", "disabled"})
        String status) {}
