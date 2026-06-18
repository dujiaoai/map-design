package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimGroupMappingRuleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminScimGroupMappingRuleDto;
import com.yunyan.saasapi.web.dto.admin.AdminScimGroupMappingRuleListResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScimGroupMappingRuleService {

  private final TenantRepository tenantRepository;
  private final ScimGroupMappingRuleRepository ruleRepository;
  private final RoleRepository roleRepository;

  public AdminScimGroupMappingRuleListResponse listRules(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var rules =
        ruleRepository.listByTenantId(tenantId).stream()
            .map(
                rule -> {
                  var roleName =
                      roleRepository
                          .findById(rule.getTenantRoleId())
                          .map(r -> r.getName())
                          .orElse("unknown");
                  return new AdminScimGroupMappingRuleDto(
                      rule.getId().toString(),
                      rule.getExternalGroupPattern(),
                      rule.getTenantRoleId().toString(),
                      roleName,
                      rule.getPriority(),
                      rule.getCreatedAt().toEpochMilli());
                })
            .toList();
    return new AdminScimGroupMappingRuleListResponse(tenantId.toString(), rules);
  }
}
