package com.yunyan.saasapi.application.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditWebhookTargetHealthCheckJob {

  private final AuditWebhookTargetHealthCheckService healthCheckService;

  @Scheduled(
      fixedDelayString = "${saas.audit.webhook-health-check-ms:300000}",
      initialDelayString = "${saas.audit.webhook-health-check-ms:300000}")
  public void checkTargets() {
    healthCheckService.checkAllEnabled();
  }
}
