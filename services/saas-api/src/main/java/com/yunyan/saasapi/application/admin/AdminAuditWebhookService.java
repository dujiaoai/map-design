package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookConfigResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookService {

  private final SaasAppProperties saasAppProperties;

  public AdminAuditWebhookConfigResponse getConfig() {
    var audit = saasAppProperties.getAudit();
    var configured = StringUtils.hasText(audit.getWebhookUrl());
    var deliveryMode = audit.isWebhookEnabled() && configured ? "webhook" : "csv_only";
    return new AdminAuditWebhookConfigResponse(
        audit.isWebhookEnabled(), configured, audit.getWebhookFormat(), deliveryMode);
  }
}
