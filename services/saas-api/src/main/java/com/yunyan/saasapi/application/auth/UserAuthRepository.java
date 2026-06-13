package com.yunyan.saasapi.application.auth;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.entity.SysUserRole;
import com.yunyan.saasapi.application.email.RegistrationVerificationService;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import com.yunyan.saasapi.domain.mapper.SysTenantMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import com.yunyan.saasapi.domain.mapper.SysUserRoleMapper;
import com.yunyan.saasapi.application.permission.PermissionResolver;
import com.yunyan.saasapi.security.AuthException;
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
public class UserAuthRepository {

  private final SysUserMapper sysUserMapper;
  private final SysTenantMapper sysTenantMapper;
  private final SysUserRoleMapper sysUserRoleMapper;
  private final SysRoleMapper sysRoleMapper;
  private final PermissionResolver permissionResolver;

  public LoginLookupResult lookupForLogin(String email, String tenantSlug) {
    return TenantRlsBypass.call(() -> lookupForLoginWithRlsBypass(email, tenantSlug));
  }

  public Optional<AuthenticatedUser> findForLogin(String email, String tenantSlug) {
    var lookup = lookupForLogin(email, tenantSlug);
    if (lookup.status() == LoginLookupStatus.FOUND) {
      return Optional.of(lookup.user());
    }
    return Optional.empty();
  }

  private LoginLookupResult lookupForLoginWithRlsBypass(String email, String tenantSlug) {
    if (StringUtils.hasText(tenantSlug)) {
      return lookupForLoginInTenant(email, tenantSlug.trim());
    }

    var activeUsers = sysUserMapper.selectList(
        Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getEmail, email)
            .eq(SysUser::getStatus, "active"));

    if (activeUsers.isEmpty()) {
      return LoginLookupResult.notFound();
    }
    if (activeUsers.size() > 1) {
      return LoginLookupResult.notFound();
    }

    var tenant = sysTenantMapper.selectById(activeUsers.getFirst().getTenantId());
    if (tenant == null) {
      return LoginLookupResult.notFound();
    }
    if (!isTenantActive(tenant)) {
      return LoginLookupResult.tenantSuspended();
    }
    return LoginLookupResult.found(toAuthenticatedUser(activeUsers.getFirst(), tenant));
  }

  private LoginLookupResult lookupForLoginInTenant(String email, String tenantSlug) {
    var tenant = sysTenantMapper.selectOne(
        Wrappers.<SysTenant>lambdaQuery().eq(SysTenant::getSlug, tenantSlug));
    if (tenant == null) {
      return LoginLookupResult.notFound();
    }
    if (!isTenantActive(tenant)) {
      return LoginLookupResult.tenantSuspended();
    }

    var activeUser = sysUserMapper.selectOne(
        Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getEmail, email)
            .eq(SysUser::getTenantId, tenant.getId())
            .eq(SysUser::getStatus, "active"));
    if (activeUser != null) {
      return LoginLookupResult.found(toAuthenticatedUser(activeUser, tenant));
    }

    var disabledUser = sysUserMapper.selectOne(
        Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getEmail, email)
            .eq(SysUser::getTenantId, tenant.getId())
            .eq(SysUser::getStatus, "disabled"));
    if (disabledUser != null) {
      return LoginLookupResult.accountDisabled(toAuthenticatedUser(disabledUser, tenant));
    }

    var invitedUser = sysUserMapper.selectOne(
        Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getEmail, email)
            .eq(SysUser::getTenantId, tenant.getId())
            .eq(SysUser::getStatus, "invited"));
    if (invitedUser != null) {
      return LoginLookupResult.invitePending(toAuthenticatedUser(invitedUser, tenant));
    }

    var pendingUser = sysUserMapper.selectOne(
        Wrappers.<SysUser>lambdaQuery()
            .eq(SysUser::getEmail, email)
            .eq(SysUser::getTenantId, tenant.getId())
            .eq(SysUser::getStatus, RegistrationVerificationService.STATUS_UNVERIFIED));
    if (pendingUser != null) {
      return LoginLookupResult.emailVerificationPending(toAuthenticatedUser(pendingUser, tenant));
    }

    return LoginLookupResult.notFound();
  }

  public AuthenticatedUser registerMember(
      String email, String passwordHash, String displayName, String tenantSlug) {
    return TenantRlsBypass.call(
        () -> registerMemberWithRlsBypass(email, passwordHash, displayName, tenantSlug));
  }

  private AuthenticatedUser registerMemberWithRlsBypass(
      String email, String passwordHash, String displayName, String tenantSlug) {
    var tenant =
        sysTenantMapper.selectOne(
            Wrappers.<SysTenant>lambdaQuery().eq(SysTenant::getSlug, tenantSlug.trim()));
    if (tenant == null) {
      throw AuthException.notFound("Tenant not found");
    }
    if (!isTenantActive(tenant)) {
      throw AuthException.forbidden("Tenant is suspended");
    }

    var duplicate =
        sysUserMapper.selectOne(
            Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getEmail, email)
                .eq(SysUser::getTenantId, tenant.getId()));
    if (duplicate != null) {
      throw AuthException.conflict("Email already registered for this tenant");
    }

    var memberRole =
        sysRoleMapper.selectOne(Wrappers.<SysRole>lambdaQuery().eq(SysRole::getCode, "MEMBER"));
    if (memberRole == null) {
      throw new IllegalStateException("MEMBER role is not seeded");
    }

    var user = new SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenant.getId());
    user.setEmail(email);
    user.setPasswordHash(passwordHash);
    user.setDisplayName(resolveDisplayName(email, displayName));
    user.setStatus("active");
    sysUserMapper.insert(user);

    var userRole = new SysUserRole();
    userRole.setUserId(user.getId());
    userRole.setRoleId(memberRole.getId());
    sysUserRoleMapper.insert(userRole);

    return toAuthenticatedUser(user, tenant);
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }

  private static boolean isTenantActive(SysTenant tenant) {
    return tenant.getStatus() == null || "active".equals(tenant.getStatus());
  }

  public void touchLastLoginAt(UUID userId) {
    TenantRlsBypass.run(
        () -> {
          var user = new SysUser();
          user.setId(userId);
          user.setLastLoginAt(Instant.now());
          sysUserMapper.updateById(user);
        });
  }

  public void updatePasswordHash(UUID userId, String passwordHash) {
    var user = sysUserMapper.selectById(userId);
    if (user == null || !"active".equals(user.getStatus())) {
      throw AuthException.unauthorized("User not found");
    }
    user.setPasswordHash(passwordHash);
    sysUserMapper.updateById(user);
  }

  public AuthenticatedUser updateDisplayName(UUID userId, String displayName) {
    var user = sysUserMapper.selectById(userId);
    if (user == null || !"active".equals(user.getStatus())) {
      throw AuthException.unauthorized("User not found");
    }
    user.setDisplayName(displayName);
    sysUserMapper.updateById(user);

    var tenant = sysTenantMapper.selectById(user.getTenantId());
    if (tenant == null) {
      throw AuthException.unauthorized("User not found");
    }
    return toAuthenticatedUser(user, tenant);
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
        roleCodes,
        permissionResolver.resolveByRoleCodes(roleCodes));
  }
}
