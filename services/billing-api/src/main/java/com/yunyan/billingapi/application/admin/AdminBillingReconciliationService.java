package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.application.ops.BillingOpsAlertService;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.domain.mapper.BillingReconciliationSummary;
import com.yunyan.billingapi.web.dto.AdminReconciliationDailyResponse;
import com.yunyan.billingapi.web.dto.AdminReconciliationStatusResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AdminBillingReconciliationService {

  private final BillingRechargeOrderMapper orderMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final BillingOpsAlertService opsAlertService;

  public AdminBillingReconciliationService(
      BillingRechargeOrderMapper orderMapper,
      BillingLedgerMapper ledgerMapper,
      BillingOpsAlertService opsAlertService) {
    this.orderMapper = orderMapper;
    this.ledgerMapper = ledgerMapper;
    this.opsAlertService = opsAlertService;
  }

  public AdminReconciliationStatusResponse getStatus(LocalDate date) {
    var report = getDailyReport(date);
    return new AdminReconciliationStatusResponse(
        report.date(),
        report.balanced(),
        report.discrepancies().size(),
        report.discrepancies(),
        opsAlertService.countOpenReconciliationAlerts(),
        opsAlertService.latestReconciliationAlertAt());
  }

  public AdminReconciliationDailyResponse getDailyReport(LocalDate date) {
    var from = date.atStartOfDay(ZoneOffset.UTC).toInstant();
    var to = date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

    var paidOrders = nullSafe(orderMapper.summarizePaidOrdersInRange(from, to));
    var refundedOrders = nullSafe(orderMapper.summarizeRefundedOrdersInRange(from, to));
    var rechargeLedger = nullSafe(ledgerMapper.summarizeRechargeLedgerInRange(from, to));
    var refundLedger = nullSafe(ledgerMapper.summarizeRefundLedgerInRange(from, to));

    var discrepancies = new ArrayList<String>();
    if (paidOrders.getCount() != rechargeLedger.getCount()) {
      discrepancies.add(
          "paid_order_count_mismatch: orders="
              + paidOrders.getCount()
              + " ledger="
              + rechargeLedger.getCount());
    }
    if (paidOrders.getPoints() != rechargeLedger.getPoints()) {
      discrepancies.add(
          "recharge_points_mismatch: orders="
              + paidOrders.getPoints()
              + " ledger="
              + rechargeLedger.getPoints());
    }
    if (refundedOrders.getCount() != refundLedger.getCount()) {
      discrepancies.add(
          "refunded_order_count_mismatch: orders="
              + refundedOrders.getCount()
              + " ledger="
              + refundLedger.getCount());
    }
    if (refundedOrders.getPoints() != refundLedger.getPoints()) {
      discrepancies.add(
          "refund_points_mismatch: orders="
              + refundedOrders.getPoints()
              + " ledger="
              + refundLedger.getPoints());
    }

    return new AdminReconciliationDailyResponse(
        date,
        from,
        to,
        paidOrders.getCount(),
        paidOrders.getPoints(),
        paidOrders.getGmvCents(),
        rechargeLedger.getCount(),
        rechargeLedger.getPoints(),
        refundedOrders.getCount(),
        refundedOrders.getPoints(),
        refundedOrders.getGmvCents(),
        refundLedger.getCount(),
        refundLedger.getPoints(),
        discrepancies.isEmpty(),
        List.copyOf(discrepancies));
  }

  private static BillingReconciliationSummary nullSafe(BillingReconciliationSummary summary) {
    if (summary != null) {
      return summary;
    }
    var empty = new BillingReconciliationSummary();
    empty.setCount(0);
    empty.setPoints(0);
    empty.setGmvCents(0);
    return empty;
  }
}
