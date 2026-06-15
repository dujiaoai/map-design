package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminCouponListResponse(
    List<AdminCouponDto> items, int page, int size, long total) {}
