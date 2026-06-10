package com.yunyan.saasapi.application.permission;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.PermissionRepository;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionResolver {

  private final SysRoleMapper sysRoleMapper;
  private final PermissionRepository permissionRepository;

  public List<String> resolveByRoleCodes(List<String> roleCodes) {
    if (roleCodes == null || roleCodes.isEmpty()) {
      return List.of();
    }
    List<UUID> roleIds =
        sysRoleMapper
            .selectList(Wrappers.<SysRole>lambdaQuery().in(SysRole::getCode, roleCodes))
            .stream()
            .map(SysRole::getId)
            .toList();
    return permissionRepository.findPermissionCodesByRoleIds(roleIds);
  }
}
