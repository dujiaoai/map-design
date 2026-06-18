package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimGroupMappingRuleRepository;
import com.yunyan.saasapi.domain.entity.ScimGroup;
import com.yunyan.saasapi.domain.entity.ScimGroupMappingRule;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ScimGroupMappingEngine {

  private final ScimGroupMappingRuleRepository ruleRepository;
  private final RoleRepository roleRepository;

  public Optional<String> resolveRoleCode(UUID tenantId, ScimGroup group) {
    var displayName = group.getDisplayName();
    var externalId = group.getExternalId();
    for (var rule : ruleRepository.listByTenantId(tenantId)) {
      if (matches(rule, displayName) || matches(rule, externalId)) {
        return roleRepository
            .findById(rule.getTenantRoleId())
            .map(role -> role.getCode());
      }
    }
    return Optional.empty();
  }

  private static boolean matches(ScimGroupMappingRule rule, String value) {
    if (!StringUtils.hasText(value) || !StringUtils.hasText(rule.getExternalGroupPattern())) {
      return false;
    }
    var pattern = globToRegex(rule.getExternalGroupPattern().trim());
    return Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(value.trim()).matches();
  }

  private static String globToRegex(String glob) {
    var escaped = glob.replace(".", "\\.").replace("*", ".*").replace("?", ".");
    return "^" + escaped + "$";
  }
}
