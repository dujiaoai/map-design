package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AdminReconciliationStatusResponse(
    LocalDate checkedDate,
    boolean balanced,
    int discrepancyCount,
    List<String> discrepancies,
    long openAlertCount,
    Instant lastAlertAt) {}
