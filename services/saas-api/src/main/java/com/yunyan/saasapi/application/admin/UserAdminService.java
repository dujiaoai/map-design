package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminUserDto;
import com.yunyan.saasapi.web.dto.admin.AdminUserListResponse;
import com.yunyan.saasapi.web.dto.admin.InviteUserRequest;
import com.yunyan.saasapi.web.dto.admin.PatchUserRequest;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserAdminService {

  private static final String STATUS_ACTIVE = "active";
  private static final String DEFAULT_ROLE = "MEMBER";

  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserSessionRevoker userSessionRevoker;

  public AdminUserListResponse listUsers(Optional<UUID> tenantId, AdminListParams params) {
    tenantId.ifPresent(this::requireTenant);

    var tenantIdsFromSearch =
        params.normalizedQuery() == null
            ? List.<UUID>of()
            : tenantRepository.findIdsBySearch(params.normalizedQuery());
    var result = userRepository.findUsersForAdmin(tenantId, params, tenantIdsFromSearch);
    var tenantsById = loadTenantsById(result.items());

    var dtos =
        result.items().stream()
            .map(user -> toDto(user, tenantsById.get(user.getTenantId())))
            .toList();
    if (params.isPaginated()) {
      return AdminUserListResponse.paged(
          dtos, result.total(), params.resolvePage(), params.resolveSize());
    }
    return AdminUserListResponse.unpaged(dtos);
  }

  @Transactional
  public AdminUserDto inviteUser(InviteUserRequest request) {
    var tenant = requireActiveTenant(request.tenantId());
    var email = request.email().trim().toLowerCase();

    if (userRepository.findByTenantIdAndEmail(tenant.getId(), email).isPresent()) {
      throw AuthException.conflict("Email already registered for this tenant");
    }

    var roleCode = resolveRoleCode(request.roleCode());
    var role =
        roleRepository
            .findByCode(roleCode)
            .orElseThrow(() -> new IllegalStateException("Role is not seeded: " + roleCode));

    var user = new SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenant.getId());
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setDisplayName(resolveDisplayName(email, request.displayName()));
    user.setStatus(STATUS_ACTIVE);
    user.setCreatedAt(Instant.now());
    userRepository.insert(user);
    userRepository.insertUserRole(user.getId(), role.getId());

    return toDto(user, tenant);
  }

  @Transactional
  public AdminUserDto patchUser(UUID userId, PatchUserRequest request) {
    if (!hasPatchFields(request)) {
      throw AuthException.badRequest("At least one of displayName or status is required");
    }

    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> AuthException.notFound("User not found"));

    var previousStatus = user.getStatus();

    if (StringUtils.hasText(request.displayName())) {
      user.setDisplayName(request.displayName().trim());
    }
    if (StringUtils.hasText(request.status())) {
      user.setStatus(request.status().trim());
    }

    userRepository.update(user);
    userSessionRevoker.revokeRefreshTokenIfNewlyDisabled(
        previousStatus, user.getStatus(), user.getId());

    var tenant =
        tenantRepository
            .findById(user.getTenantId())
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return toDto(user, tenant);
  }

  private SysTenant requireTenant(UUID tenantId) {
    return tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  private SysTenant requireActiveTenant(UUID tenantId) {
    var tenant = requireTenant(tenantId);
    if (!isTenantActive(tenant)) {
      throw AuthException.forbidden("Tenant is suspended");
    }
    return tenant;
  }

  private Map<UUID, SysTenant> loadTenantsById(java.util.List<SysUser> users) {
    var tenantIds = users.stream().map(SysUser::getTenantId).distinct().toList();
    if (tenantIds.isEmpty()) {
      return Map.of();
    }
    return tenantRepository.findByIds(tenantIds).stream()
        .collect(Collectors.toMap(SysTenant::getId, Function.identity()));
  }

  private static boolean hasPatchFields(PatchUserRequest request) {
    return StringUtils.hasText(request.displayName()) || StringUtils.hasText(request.status());
  }

  private static String resolveRoleCode(String roleCode) {
    if (!StringUtils.hasText(roleCode)) {
      return DEFAULT_ROLE;
    }
    return roleCode.trim();
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }

  private static boolean isTenantActive(SysTenant tenant) {
    return tenant.getStatus() == null || STATUS_ACTIVE.equals(tenant.getStatus());
  }

  private AdminUserDto toDto(SysUser user, SysTenant tenant) {
    var roles = userRepository.findRoleCodesByUserId(user.getId());
    var createdAt = user.getCreatedAt() == null ? 0L : user.getCreatedAt().toEpochMilli();
    var status = user.getStatus() == null ? STATUS_ACTIVE : user.getStatus();
    var tenantSlug = tenant == null ? "" : tenant.getSlug();
    var tenantName = tenant == null ? "" : tenant.getName();
    return new AdminUserDto(
        user.getId().toString(),
        user.getTenantId().toString(),
        tenantSlug,
        tenantName,
        user.getEmail(),
        user.getDisplayName(),
        status,
        roles,
        createdAt,
        toEpochMillis(user.getLastLoginAt()));
  }

  private static Long toEpochMillis(Instant instant) {
    return instant == null ? null : instant.toEpochMilli();
  }
}
