package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "租户邀请链接摘要")
public record TenantInviteLinkDto(
    @Schema(description = "链接 ID") String id,
    @Schema(description = "默认角色") String roleCode,
    @Schema(description = "备注") String label,
    @Schema(description = "最大使用次数；null 表示不限") Integer maxUses,
    @Schema(description = "已使用次数") int useCount,
    @Schema(description = "过期时间 epoch ms；null 表示不过期") Long expiresAt,
    @Schema(description = "撤销时间 epoch ms") Long revokedAt,
    @Schema(description = "创建时间 epoch ms") long createdAt,
    @Schema(description = "状态：active / expired / revoked / exhausted") String status) {}
