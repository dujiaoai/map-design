package com.yunyan.billingapi.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record InternalBillingEventCountResponse(
    @Schema(description = "confirmed 消费事件数") long eventCount) {}
