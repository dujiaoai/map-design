package com.yunyan.billingapi.web.dto;

public record WireTransferRequestDto(
    String id,
    String requestNo,
    String tenantId,
    String userId,
    String companyName,
    String contactEmail,
    long amountCents,
    long points,
    String bankReference,
    String status,
    String adminRemark,
    String createdAt,
    String updatedAt) {}
