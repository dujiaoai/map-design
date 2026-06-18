package com.yunyan.saasapi.web.dto.admin;

public record ScimSyncEventSummaryResponse(
    long pendingCount,
    long tenantPendingCount,
    String conflictStrategy) {}
