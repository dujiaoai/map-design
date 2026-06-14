package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.util.List;

public record TeamUsageSummaryResponse(
    Instant from,
    Instant to,
    String productCode,
    List<TeamUsageItemDto> items,
    long totalPoints) {}
