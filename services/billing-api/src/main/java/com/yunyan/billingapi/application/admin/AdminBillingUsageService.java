package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.mapper.BillingConsumptionRecordMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.web.dto.AdminUsageItemDto;
import com.yunyan.billingapi.web.dto.AdminUsageSummaryResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingUsageService {

  private static final int DEFAULT_RANGE_DAYS = 30;
  private static final int MAX_ITEMS = 200;

  private final BillingConsumptionRecordMapper recordMapper;

  public AdminBillingUsageService(BillingConsumptionRecordMapper recordMapper) {
    this.recordMapper = recordMapper;
  }

  public AdminUsageSummaryResponse getUsage(
      UUID tenantId, Instant from, Instant to, String productCode) {
    var effectiveTo = to != null ? to : Instant.now();
    var effectiveFrom =
        from != null ? from : effectiveTo.minus(DEFAULT_RANGE_DAYS, ChronoUnit.DAYS);

    if (!effectiveFrom.isBefore(effectiveTo)) {
      throw AuthException.badRequest("from must be before to");
    }

    var normalizedProductCode = StringUtils.hasText(productCode) ? productCode.trim() : null;
    var rows =
        recordMapper.aggregatePlatformUsage(
            tenantId, effectiveFrom, effectiveTo, normalizedProductCode, MAX_ITEMS);

    var items =
        rows.stream()
            .map(
                row ->
                    new AdminUsageItemDto(
                        row.getTenantId(),
                        row.getUserId(),
                        row.getTotalPoints() != null ? row.getTotalPoints() : 0L,
                        row.getEventCount() != null ? row.getEventCount() : 0L))
            .toList();

    var totalPoints = items.stream().mapToLong(AdminUsageItemDto::totalPoints).sum();

    return new AdminUsageSummaryResponse(
        effectiveFrom, effectiveTo, normalizedProductCode, items, totalPoints);
  }
}
