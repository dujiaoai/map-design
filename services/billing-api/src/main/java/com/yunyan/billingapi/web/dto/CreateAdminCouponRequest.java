package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateAdminCouponRequest(
    @NotBlank String code,
    @Min(1) long points,
    Integer maxTotalRedemptions,
    Integer maxPerUser,
    @Pattern(regexp = "active|inactive") String status,
    String validUntil) {}
