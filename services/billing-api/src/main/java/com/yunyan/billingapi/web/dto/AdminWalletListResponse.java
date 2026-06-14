package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminWalletListResponse(
    List<AdminWalletDto> items, int page, int size, long total) {}
