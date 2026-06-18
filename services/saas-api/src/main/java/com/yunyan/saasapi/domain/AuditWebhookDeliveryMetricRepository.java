package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.AuditWebhookDeliveryMetric;
import com.yunyan.saasapi.domain.mapper.AuditWebhookDeliveryMetricMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AuditWebhookDeliveryMetricRepository {

  private final AuditWebhookDeliveryMetricMapper mapper;

  public Optional<AuditWebhookDeliveryMetric> findByDate(LocalDate date) {
    return Optional.ofNullable(
        mapper.selectOne(
            Wrappers.<AuditWebhookDeliveryMetric>lambdaQuery()
                .eq(AuditWebhookDeliveryMetric::getMetricDate, date)));
  }

  public List<AuditWebhookDeliveryMetric> listSince(LocalDate fromInclusive) {
    return mapper.selectList(
        Wrappers.<AuditWebhookDeliveryMetric>lambdaQuery()
            .ge(AuditWebhookDeliveryMetric::getMetricDate, fromInclusive)
            .orderByAsc(AuditWebhookDeliveryMetric::getMetricDate));
  }

  public void upsert(AuditWebhookDeliveryMetric row) {
    var existing = findByDate(row.getMetricDate());
    if (existing.isEmpty()) {
      if (row.getId() == null) {
        row.setId(UUID.randomUUID());
      }
      mapper.insert(row);
    } else {
      var current = existing.get();
      row.setId(current.getId());
      mapper.updateById(row);
    }
  }
}
