package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.mapper.AdminLedgerRecordRow;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.web.dto.AdminLedgerEntryDto;
import com.yunyan.billingapi.web.dto.AdminLedgerListResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingLedgerService {

  private static final int MAX_PAGE_SIZE = 100;

  private final BillingLedgerMapper ledgerMapper;

  public AdminBillingLedgerService(BillingLedgerMapper ledgerMapper) {
    this.ledgerMapper = ledgerMapper;
  }

  public AdminLedgerListResponse listLedger(
      UUID tenantId, UUID userId, String entryType, int page, int size) {
    var safePage = Math.max(page, 0);
    var safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    var offset = safePage * safeSize;
    var normalizedEntryType = StringUtils.hasText(entryType) ? entryType.trim() : null;

    var rows =
        ledgerMapper.findAdminLedgerRecords(
            tenantId, userId, normalizedEntryType, safeSize, offset);
    var total = ledgerMapper.countAdminLedgerRecords(tenantId, userId, normalizedEntryType);
    var items = rows.stream().map(this::toDto).toList();
    return new AdminLedgerListResponse(items, safePage, safeSize, total);
  }

  private AdminLedgerEntryDto toDto(AdminLedgerRecordRow row) {
    return new AdminLedgerEntryDto(
        row.getId(),
        row.getWalletId(),
        row.getTenantId(),
        row.getUserId(),
        row.getEntryType(),
        row.getAmount() != null ? row.getAmount() : 0L,
        row.getBalanceAfter() != null ? row.getBalanceAfter() : 0L,
        row.getProductCode(),
        row.getRemark(),
        row.getCreatedAt());
  }
}
