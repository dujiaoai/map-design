package com.yunyan.billingapi.web.dto;

import java.util.List;

public record WireTransferListResponse(
    List<WireTransferRequestDto> items, int page, int size, long total) {}
