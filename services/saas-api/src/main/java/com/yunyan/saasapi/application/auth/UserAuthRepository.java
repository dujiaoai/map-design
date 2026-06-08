package com.yunyan.saasapi.application.auth;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.entity.SysUserRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import com.yunyan.saasapi.domain.mapper.SysTenantMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import com.yunyan.saasapi.domain.mapper.SysUserRoleMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
@RequiredArgsConstructor
public class UserAuthRepository {

  private final SysUserMapper sysUserMapper;
  private final SysTenantMapper sysTenantMapper;
  private final SysUserRoleMapper sysUserRoleMapper;
  private final SysRoleMapper sysRoleMapper;

  public Optional<AuthenticatedUser> findForLogin(String email, String tenantSlug) {
    var users = sysUserMapper.selectList(
        Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getEmail, email)
            .eq(SysUser::getStatus, "active"));

    if (users.isEmpty()) {
      return Optional.empty();
    }

    SysUser user;
    if (StringUtils.hasText(tenantSlug)) {
      var tenant = sysTenantMapper.selectOne(
          Wrappers.<SysTenant>lambdaQuery().eq(SysTenant::getSlug, tenantSlug));
      if (tenant == null) {
        return Optional.empty();
      }
      user = users.stream()
          .filter(candidate -> tenant.getId().equals(candidate.getTenantId()))
          .findFirst()
          .orElse(null);
      if (user == null) {
        return Optional.empty();
      }
      return Optional.of(toAuthenticatedUser(user, tenant));
    }

    if (users.size() > 1) {
      return Optional.empty();
    }

    var tenant = sysTenantMapper.selectById(users.getFirst().getTenantId());
    if (tenant == null) {
      return Optional.empty();
    }
    return Optional.of(toAuthenticatedUser(users.getFirst(), tenant));
  }

  public Optional<AuthenticatedUser> findById(UUID userId) {
    var user = sysUserMapper.selectById(userId);
    if (user == null || !"active".equals(user.getStatus())) {
      return Optional.empty();
    }
    var tenant = sysTenantMapper.selectById(user.getTenantId());
    if (tenant == null) {
      return Optional.empty();
    }
    return Optional.of(toAuthenticatedUser(user, tenant));
  }

  private AuthenticatedUser toAuthenticatedUser(SysUser user, SysTenant tenant) {
    var roleIds = sysUserRoleMapper.selectList(
            Wrappers.<SysUserRole>lambdaQuery().eq(SysUserRole::getUserId, user.getId()))
        .stream()
        .map(SysUserRole::getRoleId)
        .toList();

    List<String> roleCodes = roleIds.isEmpty()
        ? List.of()
        : sysRoleMapper.selectBatchIds(roleIds).stream().map(SysRole::getCode).toList();

    return new AuthenticatedUser(
        user.getId(),
        tenant.getId(),
        tenant.getName(),
        tenant.getSlug(),
        user.getEmail(),
        user.getDisplayName(),
        user.getPasswordHash(),
        roleCodes);
  }
}
