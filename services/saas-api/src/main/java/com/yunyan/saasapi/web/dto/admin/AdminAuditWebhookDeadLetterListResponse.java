package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminAuditWebhookDeadLetterListResponse(
    @Schema(description = "死信列表") List<AdminAuditWebhookDeadLetterDto> items,
    @Schema(description = "总数") long total,
    @Schema(description = "页码") int page,
    @Schema(description = "每页条数") int size) {}
