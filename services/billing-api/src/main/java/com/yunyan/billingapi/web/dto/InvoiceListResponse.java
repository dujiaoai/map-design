package com.yunyan.billingapi.web.dto;

import java.util.List;

public record InvoiceListResponse(
    List<InvoiceRequestDto> items, int page, int size, long total) {}
