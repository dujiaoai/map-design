package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.application.admin.AuditLogListParams;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import com.yunyan.saasapi.domain.mapper.SysAdminAuditLogMapper;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
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

  public List<SysAdminAuditLog> findUndeliveredAfter(UUID lastDeliveredId, int limit) {
    var wrapper = Wrappers.<SysAdminAuditLog>lambdaQuery();
    if (lastDeliveredId != null) {
      wrapper.gt(SysAdminAuditLog::getId, lastDeliveredId);
    }
    wrapper.orderByAsc(SysAdminAuditLog::getCreatedAt).orderByAsc(SysAdminAuditLog::getId);
    if (limit > 0) {
      wrapper.last("LIMIT " + limit);
    }
    return sysAdminAuditLogMapper.selectList(wrapper);
  }

  public AdminPagedResult<SysAdminAuditLog> findLogs(AuditLogListParams params) {
    var wrapper = Wrappers.<SysAdminAuditLog>lambdaQuery();
    applyAuditSort(wrapper, params.toListParams());
    applySearch(wrapper, params.toListParams().normalizedQuery());
    applyActionFilter(wrapper, params.normalizedAction());
    applyCrossTenantFilter(wrapper, params.normalizedCrossTenant());
    applyTenantFilter(wrapper, params.normalizedTenantId());
    applyActorFilter(wrapper, params.normalizedActorUserId());
    applyCreatedAtFilter(wrapper, params.normalizedFrom(), params.normalizedTo());

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

  private static void applyTenantFilter(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      UUID tenantId) {
    if (tenantId == null) {
      return;
    }
    wrapper.eq(SysAdminAuditLog::getTargetTenantId, tenantId);
  }

  private static void applyActorFilter(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      UUID actorUserId) {
    if (actorUserId == null) {
      return;
    }
    wrapper.eq(SysAdminAuditLog::getActorUserId, actorUserId);
  }

  private static void applyCreatedAtFilter(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      Instant from,
      Instant to) {
    if (from != null) {
      wrapper.ge(SysAdminAuditLog::getCreatedAt, from);
    }
    if (to != null) {
      wrapper.le(SysAdminAuditLog::getCreatedAt, to);
    }
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

  private static void applyAuditSort(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysAdminAuditLog> wrapper,
      AdminListParams params) {
    var ascending = !params.auditSortDescending();
    switch (params.normalizedAuditSortBy()) {
      case "actorEmail" -> wrapper.orderBy(true, ascending, SysAdminAuditLog::getActorEmail);
      case "action" -> wrapper.orderBy(true, ascending, SysAdminAuditLog::getAction);
      default -> wrapper.orderBy(true, ascending, SysAdminAuditLog::getCreatedAt);
    }
    wrapper.orderByDesc(SysAdminAuditLog::getId);
  }
}
