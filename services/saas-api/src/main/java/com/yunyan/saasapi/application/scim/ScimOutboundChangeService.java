package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.application.admin.AuditWebhookHttpClient;
import com.yunyan.saasapi.domain.ScimOutboundChangeRepository;
import com.yunyan.saasapi.domain.entity.ScimOutboundChange;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ScimOutboundChangeService {

  private static final Logger log = LoggerFactory.getLogger(ScimOutboundChangeService.class);

  private final ScimOutboundChangeRepository outboundChangeRepository;
  private final AuditWebhookHttpClient httpClient;

  @Transactional
  public ScimOutboundChange queueChange(
      UUID tenantId, String resourceType, String externalId, String operation, String payload) {
    var row = new ScimOutboundChange();
    row.setId(UUID.randomUUID());
    row.setTenantId(tenantId);
    row.setResourceType(resourceType);
    row.setExternalId(externalId);
    row.setOperation(operation);
    row.setPayload(payload);
    row.setStatus(ScimOutboundChangeRepository.STATUS_PENDING);
    var now = Instant.now();
    row.setCreatedAt(now);
    row.setUpdatedAt(now);
    outboundChangeRepository.insert(row);
    return row;
  }

  /** 骨架：POST 到 IdP webhook URL（由调用方传入 URL） */
  @Transactional
  public boolean deliverToWebhook(ScimOutboundChange change, String webhookUrl) {
    if (!StringUtils.hasText(webhookUrl)) {
      return false;
    }
    var body =
        "{\"resourceType\":\""
            + change.getResourceType()
            + "\",\"externalId\":\""
            + change.getExternalId()
            + "\",\"operation\":\""
            + change.getOperation()
            + "\"}";
    var ok = httpClient.postJson(webhookUrl, body);
    change.setStatus(
        ok ? ScimOutboundChangeRepository.STATUS_DELIVERED : ScimOutboundChangeRepository.STATUS_FAILED);
    change.setUpdatedAt(Instant.now());
    outboundChangeRepository.update(change);
    if (!ok) {
      log.warn("SCIM outbound delivery failed for change {}", change.getId());
    }
    return ok;
  }
}
