package com.yunyan.billingapi.web.dto;

import java.util.List;

public record AdminRechargePackageListResponse(
    List<AdminRechargePackageDto> items, int page, int size, long total) {}
