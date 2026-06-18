package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimGroupMemberRepository;
import com.yunyan.saasapi.domain.ScimGroupRepository;
import com.yunyan.saasapi.domain.ScimSyncCursorRepository;
import com.yunyan.saasapi.domain.ScimUserExternalIdRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.ScimGroup;
import com.yunyan.saasapi.domain.entity.ScimGroupMember;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.scim.ScimCreateGroupRequest;
import com.yunyan.saasapi.web.dto.scim.ScimGroupMemberRef;
import com.yunyan.saasapi.web.dto.scim.ScimGroupResource;
import com.yunyan.saasapi.web.dto.scim.ScimListResponse;
import com.yunyan.saasapi.web.dto.scim.ScimPatchGroupRequest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ScimGroupService {

  private final TenantRepository tenantRepository;
  private final ScimGroupRepository groupRepository;
  private final ScimGroupMemberRepository memberRepository;
  private final ScimUserExternalIdRepository externalIdRepository;
  private final ScimSyncCursorRepository syncCursorRepository;
  private final RoleRepository roleRepository;

  public ScimListResponse listGroups(UUID tenantId) {
    ensureTenant(tenantId);
    touchSyncCursor(tenantId);
    var groups = groupRepository.listByTenantId(tenantId);
    List<Object> resources = new ArrayList<>(groups.size());
    for (var group : groups) {
      resources.add(toResource(group));
    }
    return new ScimListResponse(
        List.of("urn:ietf:params:scim:api:messages:2.0:ListResponse"),
        resources.size(),
        1,
        resources.size(),
        resources);
  }

  @Transactional
  public ScimGroupResource createGroup(UUID tenantId, ScimCreateGroupRequest request) {
    ensureTenant(tenantId);
    if (!StringUtils.hasText(request.displayName())) {
      throw AuthException.badRequest("displayName is required");
    }
    var externalId =
        StringUtils.hasText(request.externalId())
            ? request.externalId().trim()
            : UUID.randomUUID().toString();
    if (groupRepository.findByTenantAndExternalId(tenantId, externalId).isPresent()) {
      throw AuthException.conflict("SCIM group externalId already exists");
    }
    var group = new ScimGroup();
    group.setId(UUID.randomUUID());
    group.setTenantId(tenantId);
    group.setExternalId(externalId);
    group.setDisplayName(request.displayName().trim());
    group.setCreatedAt(Instant.now());
    group.setUpdatedAt(Instant.now());
    groupRepository.insert(group);
    replaceMembers(tenantId, group.getId(), request.members());
    touchSyncCursor(tenantId);
    return toResource(group);
  }

  public ScimGroupResource getGroup(UUID tenantId, String id) {
    var group = resolveGroup(tenantId, id);
    return toResource(group);
  }

  @Transactional
  public ScimGroupResource updateGroup(UUID tenantId, String id, ScimPatchGroupRequest request) {
    var group = resolveGroup(tenantId, id);
    if (StringUtils.hasText(request.displayName())) {
      group.setDisplayName(request.displayName().trim());
    }
    if (StringUtils.hasText(request.roleCode())) {
      var roleCode = request.roleCode().trim();
      roleRepository
          .findByCode(roleCode)
          .orElseThrow(() -> AuthException.badRequest("Unknown role code: " + roleCode));
      group.setRoleCode(roleCode);
    }
    group.setUpdatedAt(Instant.now());
    groupRepository.update(group);
    if (request.members() != null) {
      replaceMembers(tenantId, group.getId(), request.members());
    }
    touchSyncCursor(tenantId);
    return toResource(group);
  }

  @Transactional
  public void deleteGroup(UUID tenantId, String id) {
    var group = resolveGroup(tenantId, id);
    memberRepository.deleteByGroupId(group.getId());
    groupRepository.delete(group.getId());
    touchSyncCursor(tenantId);
  }

  private ScimGroup resolveGroup(UUID tenantId, String id) {
    ensureTenant(tenantId);
    return groupRepository
        .findByTenantAndExternalId(tenantId, id)
        .or(() -> groupRepository.findById(parseUuid(id)))
        .orElseThrow(() -> AuthException.notFound("SCIM group not found"));
  }

  private void replaceMembers(UUID tenantId, UUID groupId, List<ScimGroupMemberRef> members) {
    memberRepository.deleteByGroupId(groupId);
    if (members == null) {
      return;
    }
    for (var member : members) {
      if (!StringUtils.hasText(member.value())) {
        continue;
      }
      var mapping =
          externalIdRepository
              .findByTenantAndExternalId(tenantId, member.value().trim())
              .orElseThrow(() -> AuthException.badRequest("Unknown SCIM user: " + member.value()));
      var row = new ScimGroupMember();
      row.setGroupId(groupId);
      row.setUserId(mapping.getUserId());
      row.setCreatedAt(Instant.now());
      memberRepository.insert(row);
    }
  }

  private ScimGroupResource toResource(ScimGroup group) {
    var members =
        memberRepository.listByGroupId(group.getId()).stream()
            .map(
                row ->
                    externalIdRepository
                        .findByTenantAndUserId(group.getTenantId(), row.getUserId())
                        .map(mapping -> new ScimGroupMemberRef(mapping.getExternalId()))
                        .orElse(new ScimGroupMemberRef(row.getUserId().toString())))
            .toList();
    return ScimGroupResource.of(group.getExternalId(), group.getExternalId(), group.getDisplayName(), members);
  }

  private void touchSyncCursor(UUID tenantId) {
    syncCursorRepository.upsert(tenantId, Instant.now());
  }

  private void ensureTenant(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  private static UUID parseUuid(String id) {
    try {
      return UUID.fromString(id);
    } catch (IllegalArgumentException ex) {
      throw AuthException.notFound("SCIM group not found");
    }
  }
}
