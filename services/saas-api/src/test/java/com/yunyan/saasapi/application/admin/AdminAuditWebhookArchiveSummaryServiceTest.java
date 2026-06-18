package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.AuditWebhookArchiveRepository;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminAuditWebhookArchiveSummaryServiceTest {

  @Mock private AuditWebhookArchiveRepository archiveRepository;

  @InjectMocks private AdminAuditWebhookArchiveSummaryService service;

  @Test
  void getSummary_returnsCountsByRegion() {
    when(archiveRepository.countAll()).thenReturn(3L);
    when(archiveRepository.countByRegion()).thenReturn(Map.of("us-east-1", 2L, "eu-west-1", 1L));

    var summary = service.getSummary();

    assertThat(summary.totalArchived()).isEqualTo(3);
    assertThat(summary.byRegion()).hasSize(2);
  }
}
