package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record AdminRechargePackageDto(
    UUID id,
    String code,
    long points,
    long priceCents,
    String currency,
    String status,
    int sortOrder) {}
