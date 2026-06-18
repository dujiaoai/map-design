package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import com.yunyan.saasapi.domain.mapper.TenantDataExportRequestMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantDataExportRequestRepository {

  private final TenantDataExportRequestMapper mapper;

  public void insert(TenantDataExportRequest request) {
    mapper.insert(request);
  }

  public Optional<TenantDataExportRequest> findById(UUID id) {
    return Optional.ofNullable(mapper.selectById(id));
  }

  public List<TenantDataExportRequest> findByTenantId(UUID tenantId, int limit) {
    return mapper.selectList(
        Wrappers.<TenantDataExportRequest>lambdaQuery()
            .eq(TenantDataExportRequest::getTenantId, tenantId)
            .orderByDesc(TenantDataExportRequest::getCreatedAt)
            .last("LIMIT " + limit));
  }

  public List<TenantDataExportRequest> findPending(String status, int limit) {
    return mapper.selectList(
        Wrappers.<TenantDataExportRequest>lambdaQuery()
            .eq(TenantDataExportRequest::getStatus, status)
            .orderByAsc(TenantDataExportRequest::getCreatedAt)
            .last("LIMIT " + limit));
  }

  public void update(TenantDataExportRequest request) {
    mapper.updateById(request);
  }
}
