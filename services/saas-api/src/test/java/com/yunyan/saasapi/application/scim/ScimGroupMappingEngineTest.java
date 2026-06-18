package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimGroupMappingRuleRepository;
import com.yunyan.saasapi.domain.entity.ScimGroup;
import com.yunyan.saasapi.domain.entity.ScimGroupMappingRule;
import com.yunyan.saasapi.domain.entity.SysRole;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScimGroupMappingEngineTest {

  @Mock private ScimGroupMappingRuleRepository ruleRepository;
  @Mock private RoleRepository roleRepository;

  @InjectMocks private ScimGroupMappingEngine engine;

  @Test
  void resolveRoleCode_matchesGlobPattern() {
    var tenantId = UUID.randomUUID();
    var roleId = UUID.randomUUID();
    var rule = new ScimGroupMappingRule();
    rule.setExternalGroupPattern("Engineering*");
    rule.setTenantRoleId(roleId);
    rule.setPriority(1);
    when(ruleRepository.listByTenantId(tenantId)).thenReturn(List.of(rule));
    var role = new SysRole();
    role.setCode("ENGINEERING");
    when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));

    var group = new ScimGroup();
    group.setDisplayName("Engineering Team");
    group.setExternalId("eng-1");

    assertThat(engine.resolveRoleCode(tenantId, group)).contains("ENGINEERING");
  }
}
