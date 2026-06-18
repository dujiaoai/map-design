package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookCursor;
import com.yunyan.saasapi.domain.mapper.SysAdminAuditWebhookCursorMapper;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AdminAuditWebhookCursorRepository {

  private static final String DEFAULT_CURSOR_ID = "default";

  private final SysAdminAuditWebhookCursorMapper cursorMapper;

  public Optional<SysAdminAuditWebhookCursor> findDefault() {
    return Optional.ofNullable(cursorMapper.selectById(DEFAULT_CURSOR_ID));
  }

  public void upsert(UUID lastDeliveredId, Instant lastDeliveredAt) {
    var existing = cursorMapper.selectById(DEFAULT_CURSOR_ID);
    var now = Instant.now();
    if (existing == null) {
      var row = new SysAdminAuditWebhookCursor();
      row.setId(DEFAULT_CURSOR_ID);
      row.setLastDeliveredId(lastDeliveredId);
      row.setLastDeliveredAt(lastDeliveredAt);
      row.setUpdatedAt(now);
      cursorMapper.insert(row);
      return;
    }
    existing.setLastDeliveredId(lastDeliveredId);
    existing.setLastDeliveredAt(lastDeliveredAt);
    existing.setUpdatedAt(now);
    cursorMapper.updateById(existing);
  }
}
