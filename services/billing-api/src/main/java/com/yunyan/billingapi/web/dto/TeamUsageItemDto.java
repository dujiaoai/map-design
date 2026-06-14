package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record TeamUsageItemDto(UUID userId, long totalPoints, long eventCount) {}
