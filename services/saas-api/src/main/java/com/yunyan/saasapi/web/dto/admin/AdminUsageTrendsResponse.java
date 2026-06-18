package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminUsageTrendsResponse(
    @Schema(description = "近 7 日每日桶") List<AdminUsageDayBucket> days) {}
