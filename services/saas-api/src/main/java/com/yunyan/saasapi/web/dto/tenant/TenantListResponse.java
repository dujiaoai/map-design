package com.yunyan.saasapi.web.dto.tenant;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "可访问租户列表")
public record TenantListResponse(List<TenantSummaryDto> items) {}
