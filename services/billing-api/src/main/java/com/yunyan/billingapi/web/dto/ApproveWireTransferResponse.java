package com.yunyan.billingapi.web.dto;

public record ApproveWireTransferResponse(
    String requestNo,
    String tenantId,
    String userId,
    String status,
    long pointsCredited,
    long walletBalanceAfter) {}
