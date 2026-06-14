package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateAdminPackageRequest(
    @NotBlank String code,
    @Min(1) long points,
    @Min(1) long priceCents,
    String currency,
    @Pattern(regexp = "active|inactive") String status,
    Integer sortOrder) {}
