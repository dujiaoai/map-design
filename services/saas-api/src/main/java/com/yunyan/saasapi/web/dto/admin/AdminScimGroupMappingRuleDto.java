package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminScimGroupMappingRuleDto(
    @Schema(description = "规则 ID") String id,
    @Schema(description = "外部组名 glob 模式") String externalGroupPattern,
    @Schema(description = "租户角色 ID") String tenantRoleId,
    @Schema(description = "角色名称") String roleName,
    @Schema(description = "优先级") int priority,
    @Schema(description = "创建时间 epoch millis") long createdAt) {}
