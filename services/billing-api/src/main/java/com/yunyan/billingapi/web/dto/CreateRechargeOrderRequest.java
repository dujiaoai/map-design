package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateRechargeOrderRequest(
    @NotBlank String packageCode,
    String channel,
    String couponCode,
    String payScene,
    String wechatOpenId) {}
