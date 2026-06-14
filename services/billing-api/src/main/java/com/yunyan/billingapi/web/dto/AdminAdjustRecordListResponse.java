package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminAdjustRecordListResponse(
    List<AdminAdjustRecordDto> items, int page, int size, long total) {}
