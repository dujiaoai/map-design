package com.yunyan.billingapi.web.dto;

public record WireTransferPlatformAccountResponse(
    boolean enabled,
    String accountName,
    String bankName,
    String accountNo,
    String transferRemark) {}
