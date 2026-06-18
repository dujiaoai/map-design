package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.ObjectStorageLifecycleAudit;
import com.yunyan.saasapi.domain.mapper.ObjectStorageLifecycleAuditMapper;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ObjectStorageLifecycleAuditRepository {

  private final ObjectStorageLifecycleAuditMapper mapper;

  public void insert(ObjectStorageLifecycleAudit row) {
    if (row.getId() == null) {
      row.setId(UUID.randomUUID());
    }
    mapper.insert(row);
  }

  public long countAll() {
    return mapper.selectCount(null);
  }
}
