package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.UserOauthBindService;
import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminUserDto;
import com.yunyan.saasapi.web.dto.admin.AdminUserListResponse;
import com.yunyan.saasapi.web.dto.admin.PatchUserRequest;
import com.yunyan.saasapi.web.dto.admin.UpdateUserRolesRequest;
import com.yunyan.saasapi.web.dto.auth.UserOauthBindsResponse;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserAdminService {

  private static final String STATUS_ACTIVE = "active";
  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";
  private static final Set<String> PLATFORM_ASSIGNABLE_ROLE_CODES = Set.of(PLATFORM_ADMIN);
  private static final Set<String> TENANT_SCOPED_ROLE_CODES =
      Set.of("TENANT_ADMIN", "MEMBER", "VIEWER");

  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final RoleRepository roleRepository;
  private final UserSessionRevoker userSessionRevoker;
  private final UserOauthBindService userOauthBindService;
  private final AdminAuditLogService adminAuditLogService;

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
  public AdminUserDto patchUser(
      SaasPrincipal principal, UUID userId, PatchUserRequest request) {
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
    userSessionRevoker.handleUserStatusChange(previousStatus, user.getStatus(), user);

    var tenant =
        tenantRepository
            .findById(user.getTenantId())
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var result = toDto(user, tenant);
    var detail = new StringBuilder("Updated user " + result.email());
    if (StringUtils.hasText(request.displayName())) {
      detail.append(" displayName");
    }
    if (StringUtils.hasText(request.status())) {
      detail.append(" status=").append(user.getStatus());
    }
    adminAuditLogService.recordPlatformUserAction(
        principal, "user.update", userId, detail.toString());
    return result;
  }

  @Transactional
  public AdminUserDto updateUserRoles(
      SaasPrincipal principal, UUID userId, UpdateUserRolesRequest request) {
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> AuthException.notFound("User not found"));

    var currentCodes = userRepository.findRoleCodesByUserId(userId);
    var tenantRoles =
        currentCodes.stream().filter(TENANT_SCOPED_ROLE_CODES::contains).sorted().toList();
    var requestedPlatformRoles = normalizePlatformRoleCodes(request.roleCodes());
    var mergedCodes = new LinkedHashSet<String>();
    mergedCodes.addAll(tenantRoles);
    mergedCodes.addAll(requestedPlatformRoles);

    var roles = resolveRolesByCodes(List.copyOf(mergedCodes));
    userRepository.replaceUserRoles(userId, roles.stream().map(SysRole::getId).toList());
    userSessionRevoker.revokeActiveSessions(userId);

    var tenant =
        tenantRepository
            .findById(user.getTenantId())
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var result = toDto(user, tenant);
    adminAuditLogService.recordPlatformUserAction(
        principal,
        "user.roles.update",
        userId,
        "Platform roles -> " + String.join(",", requestedPlatformRoles));
    return result;
  }

  public UserOauthBindsResponse listUserOauthBinds(UUID userId) {
    requireUser(userId);
    return userOauthBindService.listForUserId(userId);
  }

  @Transactional
  public void unbindUserOauth(SaasPrincipal principal, UUID userId, String providerId) {
    var user = requireUser(userId);
    userOauthBindService.unbindForUserId(userId, providerId);
    adminAuditLogService.recordPlatformUserAction(
        principal,
        "user.oauth.unbind",
        userId,
        "Removed OAuth bind provider="
            + providerId.trim()
            + " for "
            + user.getEmail());
  }

  private SysUser requireUser(UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> AuthException.notFound("User not found"));
  }

  private List<SysRole> resolveRolesByCodes(List<String> roleCodes) {
    if (roleCodes.isEmpty()) {
      return List.of();
    }
    var roles = roleRepository.findByCodes(roleCodes);
    if (roles.size() != roleCodes.size()) {
      var found = roles.stream().map(SysRole::getCode).collect(java.util.stream.Collectors.toSet());
      var unknown = roleCodes.stream().filter(code -> !found.contains(code)).sorted().toList();
      throw AuthException.badRequest("Unknown role codes: " + String.join(", ", unknown));
    }
    return roles;
  }

  private static List<String> normalizePlatformRoleCodes(List<String> roleCodes) {
    if (roleCodes == null) {
      return List.of();
    }
    var normalized = new LinkedHashSet<String>();
    for (String code : roleCodes) {
      if (code == null || code.isBlank()) {
        throw AuthException.badRequest("Role code must not be blank");
      }
      var trimmed = code.trim();
      if (!PLATFORM_ASSIGNABLE_ROLE_CODES.contains(trimmed)) {
        throw AuthException.badRequest(
            "Only platform roles can be assigned via this API: " + trimmed);
      }
      normalized.add(trimmed);
    }
    return List.copyOf(normalized);
  }

  private SysTenant requireTenant(UUID tenantId) {
    return tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> AuthException.notFound("Tenant not found"));
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
