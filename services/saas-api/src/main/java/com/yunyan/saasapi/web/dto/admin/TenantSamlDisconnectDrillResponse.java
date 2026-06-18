package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

public record TenantSamlDisconnectDrillResponse(
    @Schema(description = "演练日志 ID") UUID drillLogId,
    @Schema(description = "IdP Entity ID") String idpEntityId,
    @Schema(description = "success | failure") String result,
    @Schema(description = "延迟毫秒") long latencyMs) {}
