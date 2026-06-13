package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.entity.SysUserRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import com.yunyan.saasapi.domain.mapper.SysUserRoleMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
@RequiredArgsConstructor
public class UserRepository {

  private final SysUserMapper sysUserMapper;
  private final SysUserRoleMapper sysUserRoleMapper;
  private final SysRoleMapper sysRoleMapper;

  public List<SysUser> findAllUsers(Optional<UUID> tenantId) {
    return findUsersForAdmin(tenantId, new AdminListParams(null, null, null), List.of()).items();
  }

  public AdminPagedResult<SysUser> findUsersForAdmin(
      Optional<UUID> tenantId, AdminListParams params, List<UUID> tenantIdsFromSearch) {
    return TenantRlsBypass.call(
        () -> findUsersForAdminWithRlsBypass(tenantId, params, tenantIdsFromSearch));
  }

  public long countUsers() {
    return TenantRlsBypass.call(() -> sysUserMapper.selectCount(null));
  }

  private AdminPagedResult<SysUser> findUsersForAdminWithRlsBypass(
      Optional<UUID> tenantId, AdminListParams params, List<UUID> tenantIdsFromSearch) {
    var wrapper =
        Wrappers.<SysUser>lambdaQuery()
            .orderByAsc(SysUser::getTenantId)
            .orderByAsc(SysUser::getEmail);
    tenantId.ifPresent(id -> wrapper.eq(SysUser::getTenantId, id));

    var query = params.normalizedQuery();
    if (StringUtils.hasText(query)) {
      wrapper.and(
          w -> {
            w.like(SysUser::getEmail, query).or().like(SysUser::getDisplayName, query);
            if (!tenantIdsFromSearch.isEmpty()) {
              w.or().in(SysUser::getTenantId, tenantIdsFromSearch);
            }
          });
    }

    var status = params.normalizedStatus();
    if (StringUtils.hasText(status)) {
      wrapper.eq(SysUser::getStatus, status);
    }

    if (params.isPaginated()) {
      var page =
          sysUserMapper.selectPage(
              new Page<>(params.resolvePage(), params.resolveSize()), wrapper);
      return new AdminPagedResult<>(page.getRecords(), page.getTotal());
    }

    var users = sysUserMapper.selectList(wrapper);
    return new AdminPagedResult<>(users, users.size());
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

  public void replaceUserRoles(UUID userId, List<UUID> roleIds) {
    TenantRlsBypass.run(
        () -> {
          sysUserRoleMapper.delete(
              Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, userId));
          for (UUID roleId : roleIds) {
            var userRole = new SysUserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            sysUserRoleMapper.insert(userRole);
          }
        });
  }
}
