package com.yunyan.billingapi.application.usage;

import com.yunyan.billingapi.domain.mapper.BillingConsumptionRecordMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.TeamUsageItemDto;
import com.yunyan.billingapi.web.dto.TeamUsageSummaryResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TeamUsageService {

  private static final int DEFAULT_RANGE_DAYS = 30;

  private final BillingConsumptionRecordMapper recordMapper;

  public TeamUsageService(BillingConsumptionRecordMapper recordMapper) {
    this.recordMapper = recordMapper;
  }

  public TeamUsageSummaryResponse getTeamUsage(
      SaasPrincipal principal, Instant from, Instant to, String productCode) {
    var effectiveTo = to != null ? to : Instant.now();
    var effectiveFrom =
        from != null ? from : effectiveTo.minus(DEFAULT_RANGE_DAYS, ChronoUnit.DAYS);

    if (!effectiveFrom.isBefore(effectiveTo)) {
      throw AuthException.badRequest("from must be before to");
    }

    var normalizedProductCode = StringUtils.hasText(productCode) ? productCode.trim() : null;
    var rows =
        recordMapper.aggregateTeamUsage(
            principal.tenantId(), effectiveFrom, effectiveTo, normalizedProductCode);

    var items =
        rows.stream()
            .map(
                row ->
                    new TeamUsageItemDto(
                        row.getUserId(),
                        row.getTotalPoints() != null ? row.getTotalPoints() : 0L,
                        row.getEventCount() != null ? row.getEventCount() : 0L))
            .toList();

    var totalPoints = items.stream().mapToLong(TeamUsageItemDto::totalPoints).sum();

    return new TeamUsageSummaryResponse(
        effectiveFrom, effectiveTo, normalizedProductCode, items, totalPoints);
  }
}
