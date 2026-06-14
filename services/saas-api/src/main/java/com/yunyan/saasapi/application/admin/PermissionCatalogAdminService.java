package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.PermissionModuleRepository;
import com.yunyan.saasapi.domain.PermissionRepository;
import com.yunyan.saasapi.domain.entity.SysPermission;
import com.yunyan.saasapi.domain.entity.SysPermissionModule;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreatePermissionModuleRequest;
import com.yunyan.saasapi.web.dto.admin.CreatePermissionRequest;
import com.yunyan.saasapi.web.dto.admin.PatchPermissionModuleRequest;
import com.yunyan.saasapi.web.dto.admin.PatchPermissionRequest;
import com.yunyan.saasapi.web.dto.admin.PermissionDto;
import com.yunyan.saasapi.web.dto.admin.PermissionModuleDto;
import com.yunyan.saasapi.web.dto.admin.PermissionModuleListResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PermissionCatalogAdminService {

  private static final String SCOPE_PLATFORM = "platform";
  private static final String SCOPE_TENANT = "tenant";
  private static final String SCOPE_WORKSPACE = "workspace";

  private final PermissionModuleRepository permissionModuleRepository;
  private final PermissionRepository permissionRepository;
  private final AdminAuditLogService adminAuditLogService;

  public PermissionModuleListResponse listModulesWithPermissions() {
    var modulesById = loadModuleMap();
    var modules =
        permissionModuleRepository.findAllOrdered().stream()
            .map(
                module ->
                    toModuleDto(
                        module,
                        permissionRepository.findByModuleId(module.getId()).stream()
                            .map(permission -> toPermissionDto(permission, modulesById))
                            .toList()))
            .toList();
    return new PermissionModuleListResponse(modules);
  }

  @Transactional
  public PermissionModuleDto createModule(
      SaasPrincipal principal, CreatePermissionModuleRequest request) {
    var code = normalizeModuleCode(request.code());
    if (permissionModuleRepository.findByCode(code).isPresent()) {
      throw AuthException.conflict("Permission module already exists: " + code);
    }

    var module = new SysPermissionModule();
    module.setId(UUID.randomUUID());
    module.setCode(code);
    module.setName(request.name().trim());
    module.setDescription(trimToNull(request.description()));
    module.setScope(normalizeScope(request.scope()));
    module.setIsSystem(false);
    module.setSortOrder(request.sortOrder() == null ? 100 : request.sortOrder());
    permissionModuleRepository.insert(module);

    adminAuditLogService.recordPlatformUserAction(
        principal, "permission_module.create", null, "Created module " + code);
    return toModuleDto(module, List.of());
  }

  @Transactional
  public PermissionModuleDto patchModule(
      SaasPrincipal principal, UUID moduleId, PatchPermissionModuleRequest request) {
    if (!hasModulePatchFields(request)) {
      throw AuthException.badRequest("At least one field is required");
    }
    var module = requireModule(moduleId);
    if (Boolean.TRUE.equals(module.getIsSystem()) && StringUtils.hasText(request.scope())) {
      throw AuthException.badRequest("System module scope cannot be changed");
    }
    if (StringUtils.hasText(request.name())) {
      module.setName(request.name().trim());
    }
    if (request.description() != null) {
      module.setDescription(trimToNull(request.description()));
    }
    if (StringUtils.hasText(request.scope())) {
      var nextScope = normalizeScope(request.scope());
      if (!module.getScope().equals(nextScope)
          && permissionRepository.countByModuleId(moduleId) > 0) {
        throw AuthException.badRequest("Cannot change scope while module has permissions");
      }
      module.setScope(nextScope);
    }
    if (request.sortOrder() != null) {
      module.setSortOrder(request.sortOrder());
    }
    permissionModuleRepository.update(module);

    adminAuditLogService.recordPlatformUserAction(
        principal, "permission_module.update", null, "Updated module " + module.getCode());
    return toModuleDto(
        module,
        permissionRepository.findByModuleId(moduleId).stream()
            .map(permission -> toPermissionDto(permission, loadModuleMap()))
            .toList());
  }

  @Transactional
  public void deleteModule(SaasPrincipal principal, UUID moduleId) {
    var module = requireModule(moduleId);
    if (Boolean.TRUE.equals(module.getIsSystem())) {
      throw AuthException.badRequest("System permission module cannot be deleted");
    }
    if (permissionRepository.countByModuleId(moduleId) > 0) {
      throw AuthException.badRequest("Delete permissions in module before removing module");
    }
    permissionModuleRepository.deleteById(moduleId);
    adminAuditLogService.recordPlatformUserAction(
        principal, "permission_module.delete", null, "Deleted module " + module.getCode());
  }

  @Transactional
  public PermissionDto createPermission(
      SaasPrincipal principal, UUID moduleId, CreatePermissionRequest request) {
    var module = requireModule(moduleId);
    if (Boolean.TRUE.equals(module.getIsSystem())) {
      throw AuthException.badRequest("Cannot add permissions to system modules here");
    }
    var code = buildPermissionCode(module.getCode(), request.action());
    if (permissionRepository.existsByCode(code)) {
      throw AuthException.conflict("Permission code already exists: " + code);
    }

    var permission = new SysPermission();
    permission.setId(UUID.randomUUID());
    permission.setCode(code);
    permission.setName(request.name().trim());
    permission.setDescription(trimToNull(request.description()));
    permission.setScope(module.getScope());
    permission.setModuleId(moduleId);
    permission.setIsSystem(false);
    permissionRepository.insert(permission);

    adminAuditLogService.recordPlatformUserAction(
        principal, "permission.create", null, "Created permission " + code);
    return toPermissionDto(permission, loadModuleMap());
  }

  @Transactional
  public PermissionDto patchPermission(
      SaasPrincipal principal, UUID permissionId, PatchPermissionRequest request) {
    if (!hasPermissionPatchFields(request)) {
      throw AuthException.badRequest("At least one field is required");
    }
    var permission = requirePermission(permissionId);
    if (StringUtils.hasText(request.name())) {
      permission.setName(request.name().trim());
    }
    if (request.description() != null) {
      permission.setDescription(trimToNull(request.description()));
    }
    permissionRepository.update(permission);

    adminAuditLogService.recordPlatformUserAction(
        principal, "permission.update", null, "Updated permission " + permission.getCode());
    return toPermissionDto(permission, loadModuleMap());
  }

  @Transactional
  public void deletePermission(SaasPrincipal principal, UUID permissionId) {
    var permission = requirePermission(permissionId);
    if (Boolean.TRUE.equals(permission.getIsSystem())) {
      throw AuthException.badRequest("System permission cannot be deleted");
    }
    if (permissionRepository.countRoleBindingsByPermissionId(permissionId) > 0) {
      throw AuthException.badRequest("Permission is bound to roles; remove bindings first");
    }
    permissionRepository.deleteById(permissionId);
    adminAuditLogService.recordPlatformUserAction(
        principal, "permission.delete", null, "Deleted permission " + permission.getCode());
  }

  public static PermissionDto toPermissionDto(
      SysPermission permission, Map<UUID, SysPermissionModule> modulesById) {
    var module =
        permission.getModuleId() == null ? null : modulesById.get(permission.getModuleId());
    return new PermissionDto(
        permission.getId().toString(),
        permission.getCode(),
        permission.getName(),
        permission.getDescription(),
        permission.getScope(),
        module == null ? null : module.getId().toString(),
        module == null ? null : module.getCode(),
        module == null ? null : module.getName(),
        Boolean.TRUE.equals(permission.getIsSystem()));
  }

  private PermissionModuleDto toModuleDto(
      SysPermissionModule module, List<PermissionDto> permissions) {
    return new PermissionModuleDto(
        module.getId().toString(),
        module.getCode(),
        module.getName(),
        module.getDescription(),
        module.getScope(),
        Boolean.TRUE.equals(module.getIsSystem()),
        module.getSortOrder() == null ? 0 : module.getSortOrder(),
        permissions);
  }

  private Map<UUID, SysPermissionModule> loadModuleMap() {
    return permissionModuleRepository.findAllOrdered().stream()
        .collect(Collectors.toMap(SysPermissionModule::getId, Function.identity()));
  }

  private SysPermissionModule requireModule(UUID moduleId) {
    return permissionModuleRepository
        .findById(moduleId)
        .orElseThrow(() -> AuthException.notFound("Permission module not found"));
  }

  private SysPermission requirePermission(UUID permissionId) {
    return permissionRepository
        .findById(permissionId)
        .orElseThrow(() -> AuthException.notFound("Permission not found"));
  }

  private static String buildPermissionCode(String moduleCode, String action) {
    var normalizedAction = action.trim().toLowerCase();
    if (!StringUtils.hasText(normalizedAction)) {
      throw AuthException.badRequest("Permission action is required");
    }
    return moduleCode + ":" + normalizedAction;
  }

  private static String normalizeModuleCode(String code) {
    if (!StringUtils.hasText(code)) {
      throw AuthException.badRequest("Module code is required");
    }
    return code.trim().toLowerCase();
  }

  private static String normalizeScope(String scope) {
    var normalized = scope.trim().toLowerCase();
    if (!SCOPE_PLATFORM.equals(normalized)
        && !SCOPE_TENANT.equals(normalized)
        && !SCOPE_WORKSPACE.equals(normalized)) {
      throw AuthException.badRequest("Invalid scope: " + scope);
    }
    return normalized;
  }

  private static boolean hasModulePatchFields(PatchPermissionModuleRequest request) {
    return StringUtils.hasText(request.name())
        || request.description() != null
        || StringUtils.hasText(request.scope())
        || request.sortOrder() != null;
  }

  private static boolean hasPermissionPatchFields(PatchPermissionRequest request) {
    return StringUtils.hasText(request.name()) || request.description() != null;
  }

  private static String trimToNull(String value) {
    if (!StringUtils.hasText(value)) {
      return null;
    }
    return value.trim();
  }
}
