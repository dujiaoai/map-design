package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminScimGroupMappingRuleListResponse(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "映射规则列表") List<AdminScimGroupMappingRuleDto> rules) {}
