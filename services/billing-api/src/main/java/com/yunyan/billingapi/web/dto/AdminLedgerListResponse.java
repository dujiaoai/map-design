package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminLedgerListResponse(
    List<AdminLedgerEntryDto> items, int page, int size, long total) {}
