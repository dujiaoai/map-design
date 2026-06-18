package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.ScimProvisioningToken;
import com.yunyan.saasapi.domain.mapper.ScimProvisioningTokenMapper;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimProvisioningTokenRepository {

  private final ScimProvisioningTokenMapper mapper;

  public Optional<ScimProvisioningToken> findByTenantId(UUID tenantId) {
    return Optional.ofNullable(mapper.selectById(tenantId));
  }

  public Optional<ScimProvisioningToken> findEnabledByTokenHash(String tokenHash) {
    return Optional.ofNullable(
        mapper.selectOne(
            com.baomidou.mybatisplus.core.toolkit.Wrappers.<ScimProvisioningToken>lambdaQuery()
                .eq(ScimProvisioningToken::getTokenHash, tokenHash)
                .eq(ScimProvisioningToken::getEnabled, true)));
  }

  public void upsert(ScimProvisioningToken token) {
    if (mapper.selectById(token.getTenantId()) == null) {
      mapper.insert(token);
    } else {
      mapper.updateById(token);
    }
  }
}
