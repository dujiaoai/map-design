package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SuspendedTenantSessionSweepJob {

  private static final Logger log = LoggerFactory.getLogger(SuspendedTenantSessionSweepJob.class);

  private final TenantRepository tenantRepository;
  private final TenantSessionRevocationService tenantSessionRevocationService;

  @Scheduled(
      fixedDelayString = "${saas.auth.suspended-tenant-session-sweep-ms:900000}",
      initialDelayString = "${saas.auth.suspended-tenant-session-sweep-ms:900000}")
  public void sweepSuspendedTenants() {
    var revokedUsers = 0;
    for (var tenantId : tenantRepository.findSuspendedTenantIds()) {
      revokedUsers += tenantSessionRevocationService.revokeAllMemberSessions(tenantId);
    }
    if (revokedUsers > 0) {
      log.info("Suspended tenant session sweep revoked {} active session(s)", revokedUsers);
    }
  }
}
