package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AuditWebhookArchiveRepository;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookArchiveRegionCount;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookArchiveSummaryResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookArchiveSummaryService {

  private final AuditWebhookArchiveRepository archiveRepository;

  public AdminAuditWebhookArchiveSummaryResponse getSummary() {
    var byRegion = archiveRepository.countByRegion();
    List<AdminAuditWebhookArchiveRegionCount> regions = new ArrayList<>();
    for (var entry : byRegion.entrySet()) {
      regions.add(new AdminAuditWebhookArchiveRegionCount(entry.getKey(), entry.getValue()));
    }
    return new AdminAuditWebhookArchiveSummaryResponse(archiveRepository.countAll(), regions);
  }
}
