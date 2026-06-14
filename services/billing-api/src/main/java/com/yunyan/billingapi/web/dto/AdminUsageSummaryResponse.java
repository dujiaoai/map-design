package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.util.List;

public record AdminUsageSummaryResponse(
    Instant from,
    Instant to,
    String productCode,
    List<AdminUsageItemDto> items,
    long totalPoints) {}
