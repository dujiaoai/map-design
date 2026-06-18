package com.yunyan.saasapi.application.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ObjectStorageRpoMonitorJob {

  private final ObjectStorageRpoMonitorService monitorService;

  @Scheduled(
      fixedDelayString = "${saas.object-storage.rpo-monitor-ms:300000}",
      initialDelayString = "${saas.object-storage.rpo-monitor-ms:300000}")
  public void recordRpoMetric() {
    monitorService.getLatestStatus();
  }
}
