package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;

public record RedeemCouponRequest(@NotBlank String code) {}
