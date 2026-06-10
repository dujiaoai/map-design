package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminUserDto;
import com.yunyan.saasapi.web.dto.admin.InviteTenantMemberRequest;
import com.yunyan.saasapi.web.dto.admin.PatchUserRequest;
import com.yunyan.saasapi.web.dto.admin.TenantMemberListResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateMemberRolesRequest;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantMemberAdminService {

  private static final String STATUS_ACTIVE = "active";
  private static final String DEFAULT_ROLE = "MEMBER";
  private static final Set<String> ASSIGNABLE_ROLE_CODES =
      Set.of("TENANT_ADMIN", "MEMBER", "VIEWER");

  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;

  public TenantMemberListResponse listMembers(SaasPrincipal principal, UUID tenantId) {
    ensureOwnTenant(principal, tenantId);
    var tenant = requireTenant(tenantId);
    var users = userRepository.findAllUsers(Optional.of(tenantId));
    var members = users.stream().map(user -> toDto(user, tenant)).toList();
    return new TenantMemberListResponse(members);
  }

  @Transactional
  public AdminUserDto inviteMember(
      SaasPrincipal principal, UUID tenantId, InviteTenantMemberRequest request) {
    ensureOwnTenant(principal, tenantId);
    var tenant = requireActiveTenant(tenantId);
    var email = request.email().trim().toLowerCase();

    if (userRepository.findByTenantIdAndEmail(tenant.getId(), email).isPresent()) {
      throw AuthException.conflict("Email already registered for this tenant");
    }

    var role =
        roleRepository
            .findByCode(resolveRoleCode(request.roleCode()))
            .orElseThrow(() -> new IllegalStateException("Role is not seeded"));
    validateAssignableRole(role.getCode());

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
  public AdminUserDto patchMember(
      SaasPrincipal principal, UUID tenantId, UUID userId, PatchUserRequest request) {
    ensureOwnTenant(principal, tenantId);
    requireActiveTenant(tenantId);

    if (!hasPatchFields(request)) {
      throw AuthException.badRequest("At least one of displayName or status is required");
    }

    var user = requireMemberInTenant(tenantId, userId);

    if (StringUtils.hasText(request.displayName())) {
      user.setDisplayName(request.displayName().trim());
    }
    if (StringUtils.hasText(request.status())) {
      user.setStatus(request.status().trim());
    }

    userRepository.update(user);
    var tenant = requireTenant(tenantId);
    return toDto(user, tenant);
  }

  @Transactional
  public AdminUserDto updateMemberRoles(
      SaasPrincipal principal, UUID tenantId, UUID userId, UpdateMemberRolesRequest request) {
    ensureOwnTenant(principal, tenantId);
    requireActiveTenant(tenantId);
    requireMemberInTenant(tenantId, userId);

    var roles = resolveAssignableRoles(normalizeRoleCodes(request.roleCodes()));
    userRepository.replaceUserRoles(userId, roles.stream().map(SysRole::getId).toList());

    var user = requireMemberInTenant(tenantId, userId);
    var tenant = requireTenant(tenantId);
    return toDto(user, tenant);
  }

  private void ensureOwnTenant(SaasPrincipal principal, UUID tenantId) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    if (!principal.tenantId().equals(tenantId)) {
      throw AuthException.forbidden("Tenant access denied");
    }
    requireTenant(tenantId);
  }

  private SysUser requireMemberInTenant(UUID tenantId, UUID userId) {
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> AuthException.notFound("User not found"));
    if (!tenantId.equals(user.getTenantId())) {
      throw AuthException.notFound("User not found");
    }
    return user;
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

  private List<SysRole> resolveAssignableRoles(List<String> roleCodes) {
    var roles =
        roleCodes.stream()
            .map(
                code ->
                    roleRepository
                        .findByCode(code)
                        .orElseThrow(
                            () -> AuthException.badRequest("Unknown role code: " + code)))
            .toList();
    for (SysRole role : roles) {
      validateAssignableRole(role.getCode());
    }
    return roles;
  }

  private static List<String> normalizeRoleCodes(List<String> roleCodes) {
    var normalized = new LinkedHashSet<String>();
    for (String code : roleCodes) {
      if (code == null || code.isBlank()) {
        throw AuthException.badRequest("Role code must not be blank");
      }
      normalized.add(code.trim());
    }
    return List.copyOf(normalized);
  }

  private static void validateAssignableRole(String roleCode) {
    if (!ASSIGNABLE_ROLE_CODES.contains(roleCode)) {
      throw AuthException.badRequest("Role " + roleCode + " cannot be assigned to tenant members");
    }
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
    return new AdminUserDto(
        user.getId().toString(),
        user.getTenantId().toString(),
        tenant.getSlug(),
        tenant.getName(),
        user.getEmail(),
        user.getDisplayName(),
        status,
        roles,
        createdAt);
  }
}
