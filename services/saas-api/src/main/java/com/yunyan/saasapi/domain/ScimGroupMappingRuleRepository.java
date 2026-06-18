package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.ScimGroupMappingRule;
import com.yunyan.saasapi.domain.mapper.ScimGroupMappingRuleMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimGroupMappingRuleRepository {

  private final ScimGroupMappingRuleMapper mapper;

  public List<ScimGroupMappingRule> listByTenantId(UUID tenantId) {
    return mapper.selectList(
        new LambdaQueryWrapper<ScimGroupMappingRule>()
            .eq(ScimGroupMappingRule::getTenantId, tenantId)
            .orderByDesc(ScimGroupMappingRule::getPriority)
            .orderByAsc(ScimGroupMappingRule::getCreatedAt));
  }
}
