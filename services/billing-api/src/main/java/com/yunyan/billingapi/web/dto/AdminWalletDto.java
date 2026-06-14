package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record AdminWalletDto(
    UUID walletId,
    UUID tenantId,
    UUID userId,
    long balance,
    long frozenBalance,
    long availableBalance) {}
