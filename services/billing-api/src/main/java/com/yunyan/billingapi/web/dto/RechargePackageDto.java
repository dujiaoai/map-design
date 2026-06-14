package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record RechargePackageDto(
    UUID id, String code, long points, long priceCents, String currency) {}
