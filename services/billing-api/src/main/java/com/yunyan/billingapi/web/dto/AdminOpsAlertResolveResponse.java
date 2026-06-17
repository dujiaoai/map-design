package com.yunyan.billingapi.web.dto;

import java.time.Instant;

public record AdminOpsAlertResolveResponse(
    String id, Instant resolvedAt, boolean idempotentReplay) {}
