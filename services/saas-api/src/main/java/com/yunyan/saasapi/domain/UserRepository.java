package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.entity.SysUserRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import com.yunyan.saasapi.domain.mapper.SysUserRoleMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserRepository {

  private final SysUserMapper sysUserMapper;
  private final SysUserRoleMapper sysUserRoleMapper;
  private final SysRoleMapper sysRoleMapper;

  public List<SysUser> findAllUsers(Optional<UUID> tenantId) {
    return TenantRlsBypass.call(() -> findAllUsersWithRlsBypass(tenantId));
  }

  private List<SysUser> findAllUsersWithRlsBypass(Optional<UUID> tenantId) {
    var query =
        Wrappers.<SysUser>lambdaQuery()
            .orderByAsc(SysUser::getTenantId)
            .orderByAsc(SysUser::getEmail);
    tenantId.ifPresent(id -> query.eq(SysUser::getTenantId, id));
    return sysUserMapper.selectList(query);
  }

  public Optional<SysUser> findById(UUID userId) {
    return TenantRlsBypass.call(
        () -> Optional.ofNullable(sysUserMapper.selectById(userId)));
  }

  public Optional<SysUser> findByTenantIdAndEmail(UUID tenantId, String email) {
    return TenantRlsBypass.call(
        () ->
            Optional.ofNullable(
                sysUserMapper.selectOne(
                    Wrappers.<SysUser>lambdaQuery()
                        .eq(SysUser::getTenantId, tenantId)
                        .eq(SysUser::getEmail, email))));
  }

  public List<String> findRoleCodesByUserId(UUID userId) {
    return TenantRlsBypass.call(() -> findRoleCodesByUserIdWithRlsBypass(userId));
  }

  private List<String> findRoleCodesByUserIdWithRlsBypass(UUID userId) {
    var roleIds =
        sysUserRoleMapper
            .selectList(
                Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId))
            .stream()
            .map(SysUserRole::getRoleId)
            .toList();
    if (roleIds.isEmpty()) {
      return List.of();
    }
    return sysRoleMapper.selectBatchIds(roleIds).stream().map(SysRole::getCode).sorted().toList();
  }

  public void insert(SysUser user) {
    TenantRlsBypass.run(() -> sysUserMapper.insert(user));
  }

  public void update(SysUser user) {
    TenantRlsBypass.run(() -> sysUserMapper.updateById(user));
  }

  public void insertUserRole(UUID userId, UUID roleId) {
    TenantRlsBypass.run(
        () -> {
          var userRole = new SysUserRole();
          userRole.setUserId(userId);
          userRole.setRoleId(roleId);
          sysUserRoleMapper.insert(userRole);
        });
  }
}
