package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record PatchAdminCouponRequest(
    @Pattern(regexp = "active|inactive") String status,
    @Min(1) Integer maxTotalRedemptions,
    String validUntil) {}
