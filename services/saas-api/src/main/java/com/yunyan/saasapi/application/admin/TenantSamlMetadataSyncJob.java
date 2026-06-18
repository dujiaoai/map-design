package com.yunyan.saasapi.application.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantSamlMetadataSyncJob {

  private final TenantSamlMetadataSyncService metadataSyncService;

  @Scheduled(
      fixedDelayString = "${saas.auth.saml.metadata-sync-ms:3600000}",
      initialDelayString = "${saas.auth.saml.metadata-sync-ms:3600000}")
  public void syncMetadata() {
    metadataSyncService.syncAllEnabled();
  }
}
