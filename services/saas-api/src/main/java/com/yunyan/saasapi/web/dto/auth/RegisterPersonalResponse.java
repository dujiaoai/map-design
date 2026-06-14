package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "个人版注册已受理；请查收验证邮件")
public record RegisterPersonalResponse(
    @Schema(description = "个人空间 slug，用于重发验证邮件", example = "personal-a1b2c3d4")
        String tenantSlug,
    @Schema(description = "个人空间显示名", example = "个人空间") String workspaceName) {}
