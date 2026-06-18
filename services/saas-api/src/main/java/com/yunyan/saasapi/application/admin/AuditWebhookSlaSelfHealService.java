package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditWebhookSlaSelfHealService {

  private static final Logger log = LoggerFactory.getLogger(AuditWebhookSlaSelfHealService.class);

  private final AuditWebhookTargetRepository targetRepository;
  private final AuditWebhookHttpClient httpClient;
  private final SaasAppProperties saasAppProperties;

  @Transactional
  public void attemptSelfHeal() {
    var cooldown = Duration.ofMillis(Math.max(saasAppProperties.getAudit().getSelfHealCooldownMs(), 1L));
    var threshold = Instant.now().minus(cooldown);
    for (var target : targetRepository.findAllOrdered()) {
      if (Boolean.TRUE.equals(target.getEnabled())) {
        continue;
      }
      if (target.getUnhealthySince() == null || target.getUnhealthySince().isAfter(threshold)) {
        continue;
      }
      if (!httpClient.pingTarget(target.getUrl())) {
        continue;
      }
      target.setEnabled(true);
      target.setConsecutiveFailures(0);
      target.setUnhealthySince(null);
      target.setLastHealthCheckAt(Instant.now());
      target.setUpdatedAt(Instant.now());
      targetRepository.update(target);
      log.info("Self-healed audit webhook target {}", target.getId());
    }
  }

  public long countDegradedTargets() {
    return targetRepository.findAllOrdered().stream()
        .filter(t -> !Boolean.TRUE.equals(t.getEnabled()))
        .count();
  }

  public long countEligibleForSelfHeal() {
    var cooldown = Duration.ofMillis(Math.max(saasAppProperties.getAudit().getSelfHealCooldownMs(), 1L));
    var threshold = Instant.now().minus(cooldown);
    return targetRepository.findAllOrdered().stream()
        .filter(t -> !Boolean.TRUE.equals(t.getEnabled()))
        .filter(t -> t.getUnhealthySince() != null && t.getUnhealthySince().isBefore(threshold))
        .count();
  }
}
