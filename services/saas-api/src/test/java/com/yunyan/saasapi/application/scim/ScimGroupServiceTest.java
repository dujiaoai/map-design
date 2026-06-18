package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimGroupMemberRepository;
import com.yunyan.saasapi.domain.ScimGroupRepository;
import com.yunyan.saasapi.domain.ScimSyncCursorRepository;
import com.yunyan.saasapi.domain.ScimUserExternalIdRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.ScimGroup;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.web.dto.scim.ScimCreateGroupRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScimGroupServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Mock private TenantRepository tenantRepository;
  @Mock private ScimGroupRepository groupRepository;
  @Mock private ScimGroupMemberRepository memberRepository;
  @Mock private ScimUserExternalIdRepository externalIdRepository;
  @Mock private ScimSyncCursorRepository syncCursorRepository;
  @Mock private RoleRepository roleRepository;

  @InjectMocks private ScimGroupService service;

  @Test
  void listGroups_returnsResources() {
    var group = new ScimGroup();
    group.setId(UUID.randomUUID());
    group.setTenantId(TENANT_ID);
    group.setExternalId("grp-1");
    group.setDisplayName("Engineering");
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(new SysTenant()));
    when(groupRepository.listByTenantId(TENANT_ID)).thenReturn(List.of(group));
    when(memberRepository.listByGroupId(group.getId())).thenReturn(List.of());

    var response = service.listGroups(TENANT_ID);

    assertThat(response.totalResults()).isEqualTo(1);
  }

  @Test
  void createGroup_insertsRow() {
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(new SysTenant()));
    when(groupRepository.findByTenantAndExternalId(TENANT_ID, "grp-1")).thenReturn(Optional.empty());

    var resource =
        service.createGroup(
            TENANT_ID, new ScimCreateGroupRequest("grp-1", "Engineering", List.of()));

    assertThat(resource.displayName()).isEqualTo("Engineering");
  }
}
