package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "邀请链接预览（公开）")
public record InviteLinkPreviewResponse(
    @Schema(description = "租户名称") String tenantName,
    @Schema(description = "租户 slug") String tenantSlug,
    @Schema(description = "加入后角色") String roleCode,
    @Schema(description = "过期时间 epoch ms；null 表示不过期") Long expiresAt,
    @Schema(description = "剩余可用次数；null 表示不限") Integer remainingUses) {}
