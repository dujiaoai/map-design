package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "创建邀请链接响应（inviteUrl 仅返回一次）")
public record CreateTenantInviteLinkResponse(
    @Schema(description = "链接摘要") TenantInviteLinkDto link,
    @Schema(description = "完整邀请 URL，请立即复制保存") String inviteUrl) {}
