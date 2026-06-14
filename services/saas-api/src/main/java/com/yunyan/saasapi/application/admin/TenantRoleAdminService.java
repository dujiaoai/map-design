package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.PermissionRepository;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysPermission;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.TenantContext;
import com.yunyan.saasapi.web.dto.admin.AssignableRoleDto;
import com.yunyan.saasapi.web.dto.admin.AssignableRoleListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateTenantRoleRequest;
import com.yunyan.saasapi.web.dto.admin.PermissionListResponse;
import com.yunyan.saasapi.web.dto.admin.PatchTenantRoleRequest;
import com.yunyan.saasapi.web.dto.admin.PermissionDto;
import com.yunyan.saasapi.web.dto.admin.RolePermissionsResponse;
import com.yunyan.saasapi.web.dto.admin.TenantRoleListResponse;
import com.yunyan.saasapi.web.dto.admin.TenantRoleSummaryDto;
import com.yunyan.saasapi.web.dto.admin.UpdateRolePermissionsRequest;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantRoleAdminService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";
  private static final Set<String> RESERVED_ROLE_CODES =
      Set.of("PLATFORM_ADMIN", "TENANT_ADMIN", "MEMBER", "VIEWER");
  private static final Set<String> TENANT_CUSTOM_SCOPES = Set.of("tenant", "workspace");

  private final RoleRepository roleRepository;
  private final PermissionRepository permissionRepository;
  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final UserSessionRevoker userSessionRevoker;
  private final AdminAuditLogService adminAuditLogService;

  public TenantRoleListResponse listCustomRoles(SaasPrincipal principal, UUID tenantId) {
    ensureOwnTenant(principal, tenantId);
    var roles =
        withTargetTenant(
            tenantId,
            () ->
                roleRepository.findCustomRolesByTenantId(tenantId).stream()
                    .map(this::toTenantRoleSummary)
                    .toList());
    return new TenantRoleListResponse(roles);
  }

  public AssignableRoleListResponse listAssignableRoles(SaasPrincipal principal, UUID tenantId) {
    ensureOwnTenant(principal, tenantId);
    var roles =
        withTargetTenant(
            tenantId,
            () ->
                roleRepository.findAssignableRolesForTenant(tenantId).stream()
                    .map(this::toAssignableRole)
                    .toList());
    return new AssignableRoleListResponse(roles);
  }

  public PermissionListResponse listAssignablePermissions(SaasPrincipal principal, UUID tenantId) {
    ensureOwnTenant(principal, tenantId);
    var permissions =
        withTargetTenant(
            tenantId,
            () ->
                permissionRepository.findByScopesOrdered(TENANT_CUSTOM_SCOPES).stream()
                    .map(this::toPermissionDto)
                    .toList());
    return new PermissionListResponse(permissions);
  }

  @Transactional
  public TenantRoleSummaryDto createRole(
      SaasPrincipal principal, UUID tenantId, CreateTenantRoleRequest request) {
    ensureOwnTenant(principal, tenantId);
    return withTargetTenant(
        tenantId,
        () -> {
          requireActiveTenant(tenantId);
          var code = normalizeRoleCode(request.code());
          validateCustomRoleCode(code);
          if (roleRepository.findCustomRoleByTenantIdAndCode(tenantId, code).isPresent()) {
            throw AuthException.conflict("Role code already exists in tenant: " + code);
          }

          var role = new SysRole();
          role.setId(UUID.randomUUID());
          role.setTenantId(tenantId);
          role.setCode(code);
          role.setName(request.name().trim());
          role.setDescription(trimToNull(request.description()));
          role.setIsSystem(false);
          roleRepository.insert(role);

          var permissionCodes = normalizePermissionCodes(request.permissionCodes());
          if (!permissionCodes.isEmpty()) {
            var permissions = resolvePermissions(permissionCodes);
            validateCustomRolePermissions(permissions);
            permissionRepository.replaceRolePermissions(
                role.getId(), permissions.stream().map(SysPermission::getId).toList());
          }

          adminAuditLogService.recordMemberAction(
              principal,
              "tenant_role.create",
              tenantId,
              null,
              "Created role " + code);
          return toTenantRoleSummary(role);
        });
  }

  @Transactional
  public TenantRoleSummaryDto patchRole(
      SaasPrincipal principal, UUID tenantId, UUID roleId, PatchTenantRoleRequest request) {
    ensureOwnTenant(principal, tenantId);
    if (!hasPatchFields(request)) {
      throw AuthException.badRequest("At least one of name or description is required");
    }
    return withTargetTenant(
        tenantId,
        () -> {
          var role = requireCustomRole(tenantId, roleId);
          if (StringUtils.hasText(request.name())) {
            role.setName(request.name().trim());
          }
          if (request.description() != null) {
            role.setDescription(trimToNull(request.description()));
          }
          roleRepository.update(role);
          adminAuditLogService.recordMemberAction(
              principal, "tenant_role.update", tenantId, null, "Updated role " + role.getCode());
          return toTenantRoleSummary(role);
        });
  }

  @Transactional
  public void deleteRole(SaasPrincipal principal, UUID tenantId, UUID roleId) {
    ensureOwnTenant(principal, tenantId);
    withTargetTenant(
        tenantId,
        () -> {
          var role = requireCustomRole(tenantId, roleId);
          var memberCount = userRepository.findUserIdsByRoleId(roleId).size();
          if (memberCount > 0) {
            throw AuthException.conflict("Role is assigned to " + memberCount + " member(s)");
          }
          permissionRepository.replaceRolePermissions(roleId, List.of());
          roleRepository.deleteById(roleId);
          adminAuditLogService.recordMemberAction(
              principal, "tenant_role.delete", tenantId, null, "Deleted role " + role.getCode());
          return null;
        });
  }

  public RolePermissionsResponse getRolePermissions(
      SaasPrincipal principal, UUID tenantId, UUID roleId) {
    ensureOwnTenant(principal, tenantId);
    return withTargetTenant(
        tenantId,
        () -> {
          var role = requireCustomRole(tenantId, roleId);
          var permissions =
              permissionRepository.findByRoleId(roleId).stream().map(this::toPermissionDto).toList();
          return new RolePermissionsResponse(
              role.getId().toString(), role.getCode(), permissions);
        });
  }

  @Transactional
  public RolePermissionsResponse updateRolePermissions(
      SaasPrincipal principal,
      UUID tenantId,
      UUID roleId,
      UpdateRolePermissionsRequest request) {
    ensureOwnTenant(principal, tenantId);
    return withTargetTenant(
        tenantId,
        () -> {
          var role = requireCustomRole(tenantId, roleId);
          var previousCodes =
              permissionRepository.findByRoleId(roleId).stream()
                  .map(SysPermission::getCode)
                  .sorted()
                  .toList();
          var requestedCodes = normalizePermissionCodes(request.permissionCodes());
          var permissions = resolvePermissions(requestedCodes);
          validateCustomRolePermissions(permissions);
          permissionRepository.replaceRolePermissions(
              roleId, permissions.stream().map(SysPermission::getId).toList());

          for (UUID userId : userRepository.findUserIdsByRoleId(roleId)) {
            userSessionRevoker.revokeActiveSessions(userId);
          }
          adminAuditLogService.recordRolePermissionUpdate(
              principal,
              roleId,
              role.getCode(),
              "permissions "
                  + String.join(",", previousCodes)
                  + " -> "
                  + String.join(",", requestedCodes));

          var updated =
              permissionRepository.findByRoleId(roleId).stream().map(this::toPermissionDto).toList();
          return new RolePermissionsResponse(role.getId().toString(), role.getCode(), updated);
        });
  }

  private SysRole requireCustomRole(UUID tenantId, UUID roleId) {
    var role =
        roleRepository
            .findById(roleId)
            .orElseThrow(() -> AuthException.notFound("Role not found"));
    if (role.isSystemRole() || !tenantId.equals(role.getTenantId())) {
      throw AuthException.notFound("Role not found");
    }
    return role;
  }

  private static void validateCustomRoleCode(String code) {
    if (RESERVED_ROLE_CODES.contains(code)) {
      throw AuthException.badRequest("Reserved role code: " + code);
    }
  }

  private static void validateCustomRolePermissions(List<SysPermission> permissions) {
    for (SysPermission permission : permissions) {
      if (!TENANT_CUSTOM_SCOPES.contains(permission.getScope())) {
        throw AuthException.badRequest(
            "Permission "
                + permission.getCode()
                + " (scope="
                + permission.getScope()
                + ") is not allowed for tenant custom roles");
      }
    }
  }

  private List<SysPermission> resolvePermissions(List<String> requestedCodes) {
    if (requestedCodes.isEmpty()) {
      return List.of();
    }
    var permissions = permissionRepository.findByCodes(requestedCodes);
    if (permissions.size() != requestedCodes.size()) {
      var found =
          permissions.stream().map(SysPermission::getCode).collect(java.util.stream.Collectors.toSet());
      var unknown =
          requestedCodes.stream().filter(code -> !found.contains(code)).sorted().toList();
      throw AuthException.badRequest("Unknown permission codes: " + String.join(", ", unknown));
    }
    return permissions;
  }

  private static List<String> normalizePermissionCodes(List<String> permissionCodes) {
    if (permissionCodes == null || permissionCodes.isEmpty()) {
      return List.of();
    }
    var normalized = new LinkedHashSet<String>();
    for (String code : permissionCodes) {
      if (code == null || code.isBlank()) {
        throw AuthException.badRequest("Permission code must not be blank");
      }
      normalized.add(code.trim());
    }
    return List.copyOf(normalized);
  }

  private static String normalizeRoleCode(String code) {
    if (!StringUtils.hasText(code)) {
      throw AuthException.badRequest("Role code is required");
    }
    return code.trim().toLowerCase();
  }

  private static boolean hasPatchFields(PatchTenantRoleRequest request) {
    return StringUtils.hasText(request.name()) || request.description() != null;
  }

  private static String trimToNull(String value) {
    if (!StringUtils.hasText(value)) {
      return null;
    }
    return value.trim();
  }

  private TenantRoleSummaryDto toTenantRoleSummary(SysRole role) {
    var permissionCount = permissionRepository.findByRoleId(role.getId()).size();
    var memberCount = userRepository.findUserIdsByRoleId(role.getId()).size();
    return new TenantRoleSummaryDto(
        role.getId().toString(),
        role.getCode(),
        role.getName(),
        role.getDescription(),
        role.isSystemRole(),
        permissionCount,
        memberCount);
  }

  private AssignableRoleDto toAssignableRole(SysRole role) {
    return new AssignableRoleDto(
        role.getId().toString(),
        role.getCode(),
        StringUtils.hasText(role.getName()) ? role.getName() : role.getCode(),
        role.isSystemRole());
  }

  private PermissionDto toPermissionDto(SysPermission permission) {
    return new PermissionDto(
        permission.getId().toString(),
        permission.getCode(),
        permission.getName(),
        permission.getDescription(),
        permission.getScope());
  }

  private static <T> T withTargetTenant(UUID tenantId, Supplier<T> action) {
    var previous = TenantContext.get();
    TenantContext.set(tenantId.toString());
    try {
      return action.get();
    } finally {
      if (previous == null || previous.isBlank()) {
        TenantContext.clear();
      } else {
        TenantContext.set(previous);
      }
    }
  }

  private void ensureOwnTenant(SaasPrincipal principal, UUID tenantId) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    if (principal.roleCodes().contains(PLATFORM_ADMIN)) {
      requireTenant(tenantId);
      return;
    }
    if (!principal.tenantId().equals(tenantId)) {
      throw AuthException.forbidden("Tenant access denied");
    }
    requireTenant(tenantId);
  }

  private SysTenant requireTenant(UUID tenantId) {
    return tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  private SysTenant requireActiveTenant(UUID tenantId) {
    var tenant = requireTenant(tenantId);
    if (tenant.getStatus() != null && !"active".equalsIgnoreCase(tenant.getStatus())) {
      throw AuthException.forbidden("Tenant is suspended");
    }
    return tenant;
  }
}
