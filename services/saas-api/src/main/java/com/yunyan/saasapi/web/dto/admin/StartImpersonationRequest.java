package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Schema(description = "开始租户代操作")
public record StartImpersonationRequest(
    @NotNull @Schema(description = "目标租户 ID") UUID tenantId,
    @NotBlank @Schema(description = "代操作原因（写入审计）", example = "协助客户排查成员权限") String reason) {}
