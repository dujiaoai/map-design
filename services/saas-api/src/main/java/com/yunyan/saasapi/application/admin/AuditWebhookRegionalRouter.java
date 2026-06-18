package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AuditWebhookRegionalRouter {

  private final AuditWebhookTargetRepository targetRepository;

  public List<AuditWebhookTarget> resolveTargetsForRegion(String region) {
    var normalized = StringUtils.hasText(region) ? region.trim() : "default";
    List<AuditWebhookTarget> matched = new ArrayList<>();
    for (var target : targetRepository.findEnabledOrdered()) {
      var targetRegion =
          StringUtils.hasText(target.getRegion()) ? target.getRegion().trim() : "default";
      if (normalized.equals(targetRegion) || "global".equalsIgnoreCase(targetRegion)) {
        matched.add(target);
      }
    }
    return matched;
  }
}
