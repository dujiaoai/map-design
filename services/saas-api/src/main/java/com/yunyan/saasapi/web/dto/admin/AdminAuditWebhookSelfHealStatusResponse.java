package com.yunyan.saasapi.web.dto.admin;

public record AdminAuditWebhookSelfHealStatusResponse(
    long degradedTargetCount,
    long eligibleForSelfHealCount,
    double deliveryRatePercent,
    long pendingDeadLetters) {}
