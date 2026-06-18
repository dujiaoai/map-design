package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.AuditWebhookSlaSnapshot;
import com.yunyan.saasapi.domain.mapper.AuditWebhookSlaSnapshotMapper;
import java.time.LocalDate;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AuditWebhookSlaSnapshotRepository {

  private final AuditWebhookSlaSnapshotMapper mapper;

  public Optional<AuditWebhookSlaSnapshot> findByDate(LocalDate date) {
    return Optional.ofNullable(mapper.selectById(date));
  }

  public void upsert(AuditWebhookSlaSnapshot snapshot) {
    if (mapper.selectById(snapshot.getSnapshotDate()) == null) {
      mapper.insert(snapshot);
    } else {
      mapper.updateById(snapshot);
    }
  }
}
