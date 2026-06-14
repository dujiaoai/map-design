package com.yunyan.billingapi.web.dto;

import java.util.List;

public record LedgerListResponse(List<LedgerEntryDto> items, int page, int size, long total) {}
