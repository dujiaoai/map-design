package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AdminReconciliationDailyResponse(
    LocalDate date,
    Instant from,
    Instant to,
    long paidOrderCount,
    long paidOrderPoints,
    long paidOrderGmvCents,
    long rechargeLedgerCount,
    long rechargeLedgerPoints,
    long refundedOrderCount,
    long refundedOrderPoints,
    long refundedOrderGmvCents,
    long refundLedgerCount,
    long refundLedgerPoints,
    boolean balanced,
    List<String> discrepancies) {}
