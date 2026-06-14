package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record WalletResponse(
    UUID walletId, long balance, long frozenBalance, long availableBalance) {}
