package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.application.auth.EmailNormalizer;
import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimUserExternalIdRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.ScimUserExternalId;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimCreateUserRequest;
import com.yunyan.saasapi.web.dto.scim.ScimListResponse;
import com.yunyan.saasapi.web.dto.scim.ScimPatchUserRequest;
import com.yunyan.saasapi.web.dto.scim.ScimUserResource;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ScimUserService {

  private static final String STATUS_ACTIVE = "active";
  private static final String STATUS_DISABLED = "disabled";
  private static final String DEFAULT_ROLE = "MEMBER";

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final ScimUserExternalIdRepository externalIdRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserSessionRevoker userSessionRevoker;
  private final ScimSyncEventPublisher syncEventPublisher;

  public ScimListResponse listUsers(UUID tenantId, String filter) {
    ensureTenant(tenantId);
    var since = parseLastModifiedFilter(filter);
    var mappings = externalIdRepository.listByTenantId(tenantId);
    List<Object> resources = new ArrayList<>(mappings.size());
    for (var mapping : mappings) {
      if (since != null && mapping.getCreatedAt() != null && !mapping.getCreatedAt().isAfter(since)) {
        continue;
      }
      userRepository
          .findById(mapping.getUserId())
          .ifPresent(user -> resources.add(toResource(mapping, user)));
    }
    return new ScimListResponse(
        List.of("urn:ietf:params:scim:api:messages:2.0:ListResponse"),
        resources.size(),
        1,
        resources.size(),
        resources);
  }

  @Transactional
  public ScimUserResource createUser(UUID tenantId, ScimCreateUserRequest request) {
    ensureTenant(tenantId);
    if (!StringUtils.hasText(request.userName())) {
      throw AuthException.badRequest("userName is required");
    }
    var externalId =
        StringUtils.hasText(request.externalId()) ? request.externalId().trim() : request.userName().trim();
    if (externalIdRepository.findByTenantAndExternalId(tenantId, externalId).isPresent()) {
      throw AuthException.conflict("SCIM externalId already exists");
    }
    var email = EmailNormalizer.normalize(request.userName());
    if (userRepository.findByTenantIdAndEmail(tenantId, email).isPresent()) {
      throw AuthException.conflict("Email already registered for this tenant");
    }
    var role =
        roleRepository
            .findByCode(DEFAULT_ROLE)
            .orElseThrow(() -> new IllegalStateException("Role is not seeded: " + DEFAULT_ROLE));
    var user = new SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenantId);
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
    user.setDisplayName(
        StringUtils.hasText(request.displayName()) ? request.displayName().trim() : email);
    user.setStatus(Boolean.FALSE.equals(request.active()) ? STATUS_DISABLED : STATUS_ACTIVE);
    user.setCreatedAt(Instant.now());
    userRepository.insert(user);
    userRepository.insertUserRole(user.getId(), role.getId());
    var mapping = new ScimUserExternalId();
    mapping.setTenantId(tenantId);
    mapping.setExternalId(externalId);
    mapping.setUserId(user.getId());
    mapping.setActive(!STATUS_DISABLED.equals(user.getStatus()));
    mapping.setCreatedAt(Instant.now());
    externalIdRepository.insert(mapping);
    syncEventPublisher.publishUserChange(tenantId, externalId, email);
    return toResource(mapping, user);
  }

  public ScimUserResource getUser(UUID tenantId, String id) {
    var mapping = resolveMapping(tenantId, id);
    var user =
        userRepository
            .findById(mapping.getUserId())
            .orElseThrow(() -> AuthException.notFound("SCIM user not found"));
    return toResource(mapping, user);
  }

  @Transactional
  public ScimUserResource updateUser(UUID tenantId, String id, ScimPatchUserRequest request) {
    var mapping = resolveMapping(tenantId, id);
    var user =
        userRepository
            .findById(mapping.getUserId())
            .orElseThrow(() -> AuthException.notFound("SCIM user not found"));
    var previousStatus = user.getStatus();
    if (StringUtils.hasText(request.displayName())) {
      user.setDisplayName(request.displayName().trim());
    }
    if (request.active() != null) {
      applyActiveState(user, mapping, request.active());
    }
    userRepository.update(user);
    externalIdRepository.update(mapping);
    userSessionRevoker.handleUserStatusChange(previousStatus, user.getStatus(), user);
    return toResource(mapping, user);
  }

  @Transactional
  public void deleteUser(UUID tenantId, String id) {
    updateUser(tenantId, id, new ScimPatchUserRequest(null, null, false));
  }

  private ScimUserExternalId resolveMapping(UUID tenantId, String id) {
    ensureTenant(tenantId);
    return externalIdRepository
        .findByTenantAndExternalId(tenantId, id)
        .or(() -> externalIdRepository.findByTenantAndUserId(tenantId, parseUserId(id)))
        .orElseThrow(() -> AuthException.notFound("SCIM user not found"));
  }

  private static UUID parseUserId(String id) {
    try {
      return UUID.fromString(id);
    } catch (IllegalArgumentException ex) {
      throw AuthException.notFound("SCIM user not found");
    }
  }

  private void applyActiveState(SysUser user, ScimUserExternalId mapping, boolean active) {
    mapping.setActive(active);
    user.setStatus(active ? STATUS_ACTIVE : STATUS_DISABLED);
  }

  private void ensureTenant(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  private static ScimUserResource toResource(ScimUserExternalId mapping, SysUser user) {
    return ScimUserResource.of(
        mapping.getExternalId(),
        mapping.getExternalId(),
        user.getEmail(),
        user.getDisplayName(),
        Boolean.TRUE.equals(mapping.getActive()) && STATUS_ACTIVE.equals(user.getStatus()));
  }

  private static Instant parseLastModifiedFilter(String filter) {
    if (!StringUtils.hasText(filter)) {
      return null;
    }
    var trimmed = filter.trim();
    var prefix = "meta.lastModified gt \"";
    if (!trimmed.startsWith(prefix) || !trimmed.endsWith("\"")) {
      throw AuthException.badRequest("Unsupported SCIM filter");
    }
    var value = trimmed.substring(prefix.length(), trimmed.length() - 1);
    try {
      return Instant.parse(value);
    } catch (Exception ex) {
      throw AuthException.badRequest("Invalid meta.lastModified filter value");
    }
  }
}
