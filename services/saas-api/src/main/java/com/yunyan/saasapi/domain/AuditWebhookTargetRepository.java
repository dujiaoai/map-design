package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import com.yunyan.saasapi.domain.mapper.AuditWebhookTargetMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AuditWebhookTargetRepository {

  private final AuditWebhookTargetMapper mapper;

  public List<AuditWebhookTarget> findAllOrdered() {
    return mapper.selectList(
        new LambdaQueryWrapper<AuditWebhookTarget>()
            .orderByDesc(AuditWebhookTarget::getPriority)
            .orderByAsc(AuditWebhookTarget::getCreatedAt));
  }

  public List<AuditWebhookTarget> findEnabledOrdered() {
    return mapper.selectList(
        new LambdaQueryWrapper<AuditWebhookTarget>()
            .eq(AuditWebhookTarget::getEnabled, true)
            .orderByDesc(AuditWebhookTarget::getPriority)
            .orderByAsc(AuditWebhookTarget::getCreatedAt));
  }

  public Optional<AuditWebhookTarget> findById(UUID id) {
    return Optional.ofNullable(mapper.selectById(id));
  }

  public void insert(AuditWebhookTarget row) {
    mapper.insert(row);
  }

  public void update(AuditWebhookTarget row) {
    mapper.updateById(row);
  }

  public void deleteById(UUID id) {
    mapper.deleteById(id);
  }
}
