package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysPermission;
import com.yunyan.saasapi.domain.mapper.SysPermissionMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PermissionRepository {

  private final SysPermissionMapper sysPermissionMapper;

  public List<SysPermission> findAllOrdered() {
    return sysPermissionMapper.selectList(
        Wrappers.<SysPermission>lambdaQuery().orderByAsc(SysPermission::getCode));
  }

  public List<String> findPermissionCodesByRoleId(UUID roleId) {
    return sysPermissionMapper.selectCodesByRoleId(roleId);
  }

  public List<String> findPermissionCodesByRoleIds(List<UUID> roleIds) {
    if (roleIds == null || roleIds.isEmpty()) {
      return List.of();
    }
    return sysPermissionMapper.selectCodesByRoleIds(roleIds);
  }
}
