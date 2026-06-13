package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "组织注册已受理；请查收验证邮件")
public record RegisterOrgResponse(
    @Schema(description = "新组织 slug，用于登录与重发验证邮件", example = "yunyan-survey")
        String tenantSlug,
    @Schema(description = "组织显示名", example = "云眼测绘") String orgName) {}
