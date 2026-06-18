package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditWebhookTargetHealthCheckService {

  private final AuditWebhookTargetRepository targetRepository;
  private final AuditWebhookHttpClient httpClient;
  private final SaasAppProperties saasAppProperties;

  @Transactional
  public void checkTarget(AuditWebhookTarget target) {
    var healthy = httpClient.pingTarget(target.getUrl());
    var now = Instant.now();
    target.setLastHealthCheckAt(now);
    target.setUpdatedAt(now);
    if (healthy) {
      target.setConsecutiveFailures(0);
      target.setUnhealthySince(null);
    } else {
      var failures = target.getConsecutiveFailures() == null ? 0 : target.getConsecutiveFailures();
      failures += 1;
      target.setConsecutiveFailures(failures);
      if (target.getUnhealthySince() == null) {
        target.setUnhealthySince(now);
      }
      var threshold = saasAppProperties.getAudit().getWebhookHealthFailureThreshold();
      if (failures >= threshold && Boolean.TRUE.equals(target.getEnabled())) {
        target.setEnabled(false);
      }
    }
    targetRepository.update(target);
  }

  public void checkAllEnabled() {
    for (var target : targetRepository.findEnabledOrdered()) {
      checkTarget(target);
    }
  }
}
