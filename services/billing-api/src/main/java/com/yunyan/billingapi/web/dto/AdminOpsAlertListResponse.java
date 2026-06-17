package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminOpsAlertListResponse(
    List<AdminOpsAlertDto> items, int page, int size, long total) {}
