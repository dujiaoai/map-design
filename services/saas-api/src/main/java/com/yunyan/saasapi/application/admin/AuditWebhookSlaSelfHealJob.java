package com.yunyan.saasapi.application.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditWebhookSlaSelfHealJob {

  private final AuditWebhookSlaSelfHealService selfHealService;

  @Scheduled(
      fixedDelayString = "${saas.audit.self-heal-ms:900000}",
      initialDelayString = "${saas.audit.self-heal-ms:900000}")
  public void runSelfHeal() {
    selfHealService.attemptSelfHeal();
  }
}
