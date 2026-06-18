package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditWebhookAlertService {

  private static final Logger log = LoggerFactory.getLogger(AuditWebhookAlertService.class);

  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;

  public void notifyIfDeadLettersAccumulated(long batchSize) {
    var total = deadLetterRepository.countAll();
    if (total > 0 && total % 10 == 0) {
      log.warn("Audit webhook dead letter count reached {} (latest batch size={})", total, batchSize);
    }
  }
}
