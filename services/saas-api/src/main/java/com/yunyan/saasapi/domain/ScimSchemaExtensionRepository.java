package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.ScimSchemaExtension;
import com.yunyan.saasapi.domain.mapper.ScimSchemaExtensionMapper;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimSchemaExtensionRepository {

  private final ScimSchemaExtensionMapper mapper;

  public Optional<ScimSchemaExtension> findByTenantId(UUID tenantId) {
    return Optional.ofNullable(mapper.selectById(tenantId));
  }
}
