package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.PermissionRepository;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysPermission;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.PermissionDto;
import com.yunyan.saasapi.web.dto.admin.PermissionListResponse;
import com.yunyan.saasapi.web.dto.admin.RoleListResponse;
import com.yunyan.saasapi.web.dto.admin.RolePermissionsResponse;
import com.yunyan.saasapi.web.dto.admin.RoleSummaryDto;
import com.yunyan.saasapi.web.dto.admin.UpdateRolePermissionsRequest;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleAdminService {

  private static final Set<String> PLATFORM_ADMIN_SCOPES = Set.of("platform");
  private static final Set<String> TENANT_ADMIN_SCOPES = Set.of("tenant", "workspace");
  private static final Set<String> WORKSPACE_ROLE_SCOPES = Set.of("workspace");

  private final RoleRepository roleRepository;
  private final PermissionRepository permissionRepository;
  private final UserRepository userRepository;
  private final UserSessionRevoker userSessionRevoker;
  private final AdminAuditLogService adminAuditLogService;

  public RoleListResponse listRoles() {
    var roles =
        roleRepository.findAllOrdered().stream().map(RoleAdminService::toRoleSummary).toList();
    return new RoleListResponse(roles);
  }

  public PermissionListResponse listPermissions() {
    var permissions =
        permissionRepository.findAllOrdered().stream().map(RoleAdminService::toPermissionDto).toList();
    return new PermissionListResponse(permissions);
  }

  public RolePermissionsResponse getRolePermissions(UUID roleId) {
    var role = requireRole(roleId);
    var permissions =
        permissionRepository.findByRoleId(roleId).stream().map(RoleAdminService::toPermissionDto).toList();
    return toRolePermissionsResponse(role, permissions);
  }

  @Transactional
  public RolePermissionsResponse updateRolePermissions(
      SaasPrincipal principal, UUID roleId, UpdateRolePermissionsRequest request) {
    var role = requireRole(roleId);
    var previousCodes =
        permissionRepository.findByRoleId(roleId).stream()
            .map(SysPermission::getCode)
            .sorted()
            .toList();
    var requestedCodes = normalizeCodes(request.permissionCodes());
    var permissions = resolvePermissions(requestedCodes);
    validateScopeForRole(role.getCode(), permissions);

    permissionRepository.replaceRolePermissions(
        roleId, permissions.stream().map(SysPermission::getId).toList());

    var updated =
        permissionRepository.findByRoleId(roleId).stream().map(RoleAdminService::toPermissionDto).toList();
    var updatedCodes = updated.stream().map(PermissionDto::code).sorted().toList();

    for (UUID userId : userRepository.findUserIdsByRoleId(roleId)) {
      userSessionRevoker.revokeActiveSessions(userId);
    }
    adminAuditLogService.recordRolePermissionUpdate(
        principal,
        roleId,
        role.getCode(),
        "permissions " + String.join(",", previousCodes) + " -> " + String.join(",", updatedCodes));

    return toRolePermissionsResponse(role, updated);
  }

  private SysRole requireRole(UUID roleId) {
    return roleRepository.findById(roleId).orElseThrow(() -> AuthException.notFound("Role not found"));
  }

  private List<SysPermission> resolvePermissions(List<String> requestedCodes) {
    if (requestedCodes.isEmpty()) {
      return List.of();
    }
    var permissions = permissionRepository.findByCodes(requestedCodes);
    if (permissions.size() != requestedCodes.size()) {
      var found = permissions.stream().map(SysPermission::getCode).collect(java.util.stream.Collectors.toSet());
      var unknown =
          requestedCodes.stream().filter(code -> !found.contains(code)).sorted().toList();
      throw AuthException.badRequest("Unknown permission codes: " + String.join(", ", unknown));
    }
    return permissions;
  }

  private static List<String> normalizeCodes(List<String> permissionCodes) {
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

  private static void validateScopeForRole(String roleCode, List<SysPermission> permissions) {
    var allowedScopes =
        switch (roleCode) {
          case "PLATFORM_ADMIN" -> PLATFORM_ADMIN_SCOPES;
          case "TENANT_ADMIN" -> TENANT_ADMIN_SCOPES;
          case "MEMBER", "VIEWER" -> WORKSPACE_ROLE_SCOPES;
          default -> throw AuthException.badRequest("Unsupported role: " + roleCode);
        };

    for (SysPermission permission : permissions) {
      if (!allowedScopes.contains(permission.getScope())) {
        throw AuthException.badRequest(
            "Permission "
                + permission.getCode()
                + " (scope="
                + permission.getScope()
                + ") is not allowed for role "
                + roleCode);
      }
    }
  }

  private static RoleSummaryDto toRoleSummary(SysRole role) {
    return new RoleSummaryDto(role.getId().toString(), role.getCode());
  }

  private static PermissionDto toPermissionDto(SysPermission permission) {
    return new PermissionDto(
        permission.getId().toString(),
        permission.getCode(),
        permission.getName(),
        permission.getDescription(),
        permission.getScope());
  }

  private static RolePermissionsResponse toRolePermissionsResponse(
      SysRole role, List<PermissionDto> permissions) {
    return new RolePermissionsResponse(role.getId().toString(), role.getCode(), permissions);
  }
}
