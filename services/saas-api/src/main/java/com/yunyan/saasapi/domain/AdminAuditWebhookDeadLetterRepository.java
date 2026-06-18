package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookDeadLetter;
import com.yunyan.saasapi.domain.mapper.SysAdminAuditWebhookDeadLetterMapper;
import java.time.Instant;
import java.util.Optional;
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

  public AdminPagedResult<SysAdminAuditWebhookDeadLetter> list(int page, int size) {
    var wrapper =
        Wrappers.<SysAdminAuditWebhookDeadLetter>lambdaQuery()
            .orderByDesc(SysAdminAuditWebhookDeadLetter::getCreatedAt)
            .orderByDesc(SysAdminAuditWebhookDeadLetter::getId);
    var result = deadLetterMapper.selectPage(new Page<>(page, size), wrapper);
    return new AdminPagedResult<>(result.getRecords(), result.getTotal());
  }

  public Optional<SysAdminAuditWebhookDeadLetter> findById(UUID id) {
    return Optional.ofNullable(deadLetterMapper.selectById(id));
  }

  public void deleteById(UUID id) {
    deadLetterMapper.deleteById(id);
  }

  public void incrementAttempts(UUID id, String lastError) {
    var row = deadLetterMapper.selectById(id);
    if (row == null) {
      return;
    }
    row.setAttempts(row.getAttempts() + 1);
    row.setLastError(lastError);
    row.setUpdatedAt(Instant.now());
    deadLetterMapper.updateById(row);
  }

  public long countAll() {
    return deadLetterMapper.selectCount(null);
  }

  public java.util.List<SysAdminAuditWebhookDeadLetter> listEligibleForRetry(int maxAttempts, int limit) {
    return deadLetterMapper.selectList(
        Wrappers.<SysAdminAuditWebhookDeadLetter>lambdaQuery()
            .lt(SysAdminAuditWebhookDeadLetter::getAttempts, maxAttempts)
            .orderByAsc(SysAdminAuditWebhookDeadLetter::getUpdatedAt)
            .last("LIMIT " + Math.max(limit, 1)));
  }
}
