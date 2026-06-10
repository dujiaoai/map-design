package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysPermission;
import com.yunyan.saasapi.domain.mapper.SysPermissionMapper;
import com.yunyan.saasapi.domain.entity.SysRolePermission;
import com.yunyan.saasapi.domain.mapper.SysRolePermissionMapper;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.CollectionUtils;

@Repository
@RequiredArgsConstructor
public class PermissionRepository {

  private final SysPermissionMapper sysPermissionMapper;
  private final SysRolePermissionMapper sysRolePermissionMapper;

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

  public List<SysPermission> findByCodes(Collection<String> codes) {
    if (CollectionUtils.isEmpty(codes)) {
      return List.of();
    }
    return sysPermissionMapper.selectList(
        Wrappers.<SysPermission>lambdaQuery()
            .in(SysPermission::getCode, codes)
            .orderByAsc(SysPermission::getCode));
  }

  public List<SysPermission> findByRoleId(UUID roleId) {
    var codes = findPermissionCodesByRoleId(roleId);
    if (codes.isEmpty()) {
      return List.of();
    }
    return findByCodes(codes);
  }

  public void replaceRolePermissions(UUID roleId, List<UUID> permissionIds) {
    sysRolePermissionMapper.delete(
        Wrappers.<SysRolePermission>lambdaQuery().eq(SysRolePermission::getRoleId, roleId));
    if (permissionIds == null || permissionIds.isEmpty()) {
      return;
    }
    for (UUID permissionId : permissionIds) {
      var binding = new SysRolePermission();
      binding.setRoleId(roleId);
      binding.setPermissionId(permissionId);
      sysRolePermissionMapper.insert(binding);
    }
  }
}
