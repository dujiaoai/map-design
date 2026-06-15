package com.yunyan.billingapi.application.wallet;

import java.util.UUID;

public record WalletBalanceContext(UUID tenantId, UUID userId, UUID walletId) {}
