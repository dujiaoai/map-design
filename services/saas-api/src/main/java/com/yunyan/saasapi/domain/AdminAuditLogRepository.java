package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.application.admin.AdminListParams;
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

  public AdminPagedResult<SysAdminAuditLog> findLogs(AdminListParams params) {
    var wrapper =
        Wrappers.<SysAdminAuditLog>lambdaQuery().orderByDesc(SysAdminAuditLog::getCreatedAt);
    applySearch(wrapper, params.normalizedQuery());

    if (params.isPaginated()) {
      var page = new Page<SysAdminAuditLog>(params.resolvePage(), params.resolveSize());
      var result = sysAdminAuditLogMapper.selectPage(page, wrapper);
      return new AdminPagedResult<>(result.getRecords(), result.getTotal());
    }

    var logs = sysAdminAuditLogMapper.selectList(wrapper);
    return new AdminPagedResult<>(logs, logs.size());
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
