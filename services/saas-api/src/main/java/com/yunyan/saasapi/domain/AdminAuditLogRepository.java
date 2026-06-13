package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.application.admin.AuditLogListParams;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import com.yunyan.saasapi.domain.mapper.SysAdminAuditLogMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
@RequiredArgsConstructor
public class AdminAuditLogRepository {

  private final SysAdminAuditLogMapper sysAdminAuditLogMapper;

  public void insert(SysAdminAuditLog log) {
    sysAdminAuditLogMapper.insert(log);
  }

  public AdminPagedResult<SysAdminAuditLog> findLogs(AuditLogListParams params) {
    var wrapper =
        Wrappers.<SysAdminAuditLog>lambdaQuery().orderByDesc(SysAdminAuditLog::getCreatedAt);
    applySearch(wrapper, params.toListParams().normalizedQuery());
    applyActionFilter(wrapper, params.normalizedAction());
    applyCrossTenantFilter(wrapper, params.normalizedCrossTenant());

    if (params.toListParams().isPaginated()) {
      var page = new Page<SysAdminAuditLog>(
          params.toListParams().resolvePage(), params.toListParams().resolveSize());
      var result = sysAdminAuditLogMapper.selectPage(page, wrapper);
      return new AdminPagedResult<>(result.getRecords(), result.getTotal());
    }

    var logs = sysAdminAuditLogMapper.selectList(wrapper);
    return new AdminPagedResult<>(logs, logs.size());
  }

  private static void applyActionFilter(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      String action) {
    if (!StringUtils.hasText(action)) {
      return;
    }
    wrapper.eq(SysAdminAuditLog::getAction, action);
  }

  private static void applyCrossTenantFilter(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      Boolean crossTenant) {
    if (crossTenant == null) {
      return;
    }
    wrapper.eq(SysAdminAuditLog::isCrossTenant, crossTenant);
  }

  private static void applySearch(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      String query) {
    if (!StringUtils.hasText(query)) {
      return;
    }
    var pattern = "%" + query.trim() + "%";
    wrapper.and(
        w ->
            w.like(SysAdminAuditLog::getActorEmail, pattern)
                .or()
                .like(SysAdminAuditLog::getAction, pattern)
                .or()
                .like(SysAdminAuditLog::getDetail, pattern));
  }
}
