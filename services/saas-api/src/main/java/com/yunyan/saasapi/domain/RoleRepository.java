package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RoleRepository {

  private static final Set<String> TENANT_MEMBER_SYSTEM_ROLE_CODES =
      Set.of("TENANT_ADMIN", "MEMBER", "VIEWER");

  private final SysRoleMapper sysRoleMapper;

  public List<SysRole> findSystemRolesOrdered() {
    return sysRoleMapper.selectList(
        Wrappers.<SysRole>lambdaQuery()
            .eq(SysRole::getTenantId, SysRole.SYSTEM_TENANT_ID)
            .eq(SysRole::getIsSystem, true)
            .orderByAsc(SysRole::getCode));
  }

  public List<SysRole> findAllOrdered() {
    return sysRoleMapper.selectList(Wrappers.<SysRole>lambdaQuery().orderByAsc(SysRole::getCode));
  }

  public List<SysRole> findCustomRolesByTenantId(UUID tenantId) {
    return sysRoleMapper.selectList(
        Wrappers.<SysRole>lambdaQuery()
            .eq(SysRole::getTenantId, tenantId)
            .eq(SysRole::getIsSystem, false)
            .orderByAsc(SysRole::getCode));
  }

  public List<SysRole> findAssignableRolesForTenant(UUID tenantId) {
    var systemRoles =
        sysRoleMapper.selectList(
            Wrappers.<SysRole>lambdaQuery()
                .eq(SysRole::getTenantId, SysRole.SYSTEM_TENANT_ID)
                .in(SysRole::getCode, TENANT_MEMBER_SYSTEM_ROLE_CODES)
                .orderByAsc(SysRole::getCode));
    var customRoles = findCustomRolesByTenantId(tenantId);
    var merged = new java.util.ArrayList<SysRole>(systemRoles.size() + customRoles.size());
    merged.addAll(systemRoles);
    merged.addAll(customRoles);
    return merged;
  }

  public Optional<SysRole> findById(UUID roleId) {
    return Optional.ofNullable(sysRoleMapper.selectById(roleId));
  }

  public Optional<SysRole> findSystemRoleByCode(String code) {
    return Optional.ofNullable(
        sysRoleMapper.selectOne(
            Wrappers.<SysRole>lambdaQuery()
                .eq(SysRole::getTenantId, SysRole.SYSTEM_TENANT_ID)
                .eq(SysRole::getCode, code)));
  }

  public Optional<SysRole> findByCode(String code) {
    return findSystemRoleByCode(code);
  }

  public Optional<SysRole> findCustomRoleByTenantIdAndCode(UUID tenantId, String code) {
    return Optional.ofNullable(
        sysRoleMapper.selectOne(
            Wrappers.<SysRole>lambdaQuery()
                .eq(SysRole::getTenantId, tenantId)
                .eq(SysRole::getCode, code)
                .eq(SysRole::getIsSystem, false)));
  }

  public Optional<SysRole> findRoleForTenantMember(UUID tenantId, String code) {
    if (TENANT_MEMBER_SYSTEM_ROLE_CODES.contains(code)) {
      return findSystemRoleByCode(code);
    }
    return findCustomRoleByTenantIdAndCode(tenantId, code);
  }

  public List<SysRole> findByCodes(List<String> codes) {
    if (codes == null || codes.isEmpty()) {
      return List.of();
    }
    return sysRoleMapper.selectList(
        Wrappers.<SysRole>lambdaQuery()
            .eq(SysRole::getTenantId, SysRole.SYSTEM_TENANT_ID)
            .in(SysRole::getCode, codes));
  }

  public void insert(SysRole role) {
    sysRoleMapper.insert(role);
  }

  public void update(SysRole role) {
    sysRoleMapper.updateById(role);
  }

  public void deleteById(UUID roleId) {
    sysRoleMapper.deleteById(roleId);
  }
}
