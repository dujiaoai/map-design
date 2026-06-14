package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record PatchAdminPackageRequest(
    @Min(1) Long points,
    @Min(1) Long priceCents,
    String currency,
    @Pattern(regexp = "active|inactive") String status,
    Integer sortOrder) {}
