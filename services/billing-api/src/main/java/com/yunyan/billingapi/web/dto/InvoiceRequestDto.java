package com.yunyan.billingapi.web.dto;

public record InvoiceRequestDto(
    String id,
    String tenantId,
    String userId,
    String orderNo,
    String invoiceType,
    String title,
    String taxNo,
    String email,
    String status,
    long amountCents,
    String currency,
    String adminRemark,
    String createdAt,
    String updatedAt) {}
