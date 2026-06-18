package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AuditWebhookMultiTargetDeliveryJob {

  private static final Logger log = LoggerFactory.getLogger(AuditWebhookMultiTargetDeliveryJob.class);

  private final SaasAppProperties saasAppProperties;
  private final AuditWebhookTargetRepository targetRepository;
  private final AuditWebhookHttpClient auditWebhookHttpClient;
  private final AuditWebhookHmacSigner hmacSigner;

  public void fanOutToAdditionalTargets(String payload) {
    var targets = targetRepository.findEnabledOrdered();
    if (targets.isEmpty()) {
      return;
    }
    var signingSecret = saasAppProperties.getAudit().getWebhookSigningSecret();
    for (var target : targets) {
      if (!StringUtils.hasText(target.getUrl())) {
        continue;
      }
      var signature = hmacSigner.sign(signingSecret, payload);
      var ok = auditWebhookHttpClient.postJson(target.getUrl(), payload, signature);
      if (!ok) {
        log.warn("Audit webhook fan-out failed for target {}", target.getId());
      }
    }
  }
}
