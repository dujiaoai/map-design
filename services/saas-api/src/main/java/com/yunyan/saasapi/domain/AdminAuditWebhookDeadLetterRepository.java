package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookDeadLetter;
import com.yunyan.saasapi.domain.mapper.SysAdminAuditWebhookDeadLetterMapper;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AdminAuditWebhookDeadLetterRepository {

  private final SysAdminAuditWebhookDeadLetterMapper deadLetterMapper;

  public void insert(UUID logId, String payload, String lastError) {
    var row = new SysAdminAuditWebhookDeadLetter();
    row.setId(UUID.randomUUID());
    row.setLogId(logId);
    row.setPayload(payload);
    row.setAttempts(1);
    row.setLastError(lastError);
    row.setCreatedAt(Instant.now());
    row.setUpdatedAt(Instant.now());
    deadLetterMapper.insert(row);
  }

  public long countAll() {
    return deadLetterMapper.selectCount(null);
  }
}
