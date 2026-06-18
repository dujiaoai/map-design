package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TrialExpiredTenantSuspendJob {

  private static final Logger log = LoggerFactory.getLogger(TrialExpiredTenantSuspendJob.class);

  private final TenantRepository tenantRepository;
  private final TrialExpiredTenantSuspendService trialExpiredTenantSuspendService;

  @Scheduled(
      fixedDelayString = "${saas.tenant.trial-expired-suspend-ms:3600000}",
      initialDelayString = "${saas.tenant.trial-expired-suspend-ms:3600000}")
  public void suspendExpiredTrials() {
    var now = Instant.now();
    var suspended = 0;
    for (var tenantId : tenantRepository.findTrialExpiredActiveTenantIds(now)) {
      if (trialExpiredTenantSuspendService.suspendDueToTrialExpiry(tenantId, now)) {
        suspended++;
      }
    }
    if (suspended > 0) {
      log.info("Trial expired tenant suspend job suspended {} tenant(s)", suspended);
    }
  }
}
