package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.SysEmailOutbox;
import com.yunyan.saasapi.domain.mapper.SysEmailOutboxMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class EmailOutboxRepository {

  private final SysEmailOutboxMapper sysEmailOutboxMapper;

  public void insert(SysEmailOutbox outbox) {
    TenantRlsBypass.run(() -> sysEmailOutboxMapper.insert(outbox));
  }

  public void markSent(UUID id) {
    TenantRlsBypass.run(
        () -> {
          var row = new SysEmailOutbox();
          row.setId(id);
          row.setStatus("sent");
          row.setSentAt(Instant.now());
          sysEmailOutboxMapper.updateById(row);
        });
  }

  public void markFailed(UUID id, String errorMessage) {
    TenantRlsBypass.run(
        () -> {
          var row = new SysEmailOutbox();
          row.setId(id);
          row.setStatus("failed");
          row.setErrorMessage(errorMessage);
          sysEmailOutboxMapper.updateById(row);
        });
  }
}
