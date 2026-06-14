package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminRechargeOrderListResponse(
    List<AdminRechargeOrderDto> items, int page, int size, long total) {}
