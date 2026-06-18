package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminAuditWebhookArchiveSummaryResponse(
    @Schema(description = "归档总数") long totalArchived,
    @Schema(description = "按区域计数") List<AdminAuditWebhookArchiveRegionCount> byRegion) {}
