package com.yunyan.billingapi.application.reconciliation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.web.dto.AdminReconciliationDailyResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

@ExtendWith(MockitoExtension.class)
class ReconciliationAlertNotifierTest {

  @Mock RestClient restClient;
  @Mock RestClient.RequestBodyUriSpec requestBodyUriSpec;
  @Mock RestClient.RequestBodySpec requestBodySpec;
  @Mock RestClient.ResponseSpec responseSpec;

  private final BillingAppProperties props = new BillingAppProperties();
  private ReconciliationAlertNotifier notifier;

  @BeforeEach
  void setUp() {
    notifier = new ReconciliationAlertNotifier(props, restClient, new ObjectMapper());
  }

  @Test
  void notifyUnbalancedIfConfigured_whenDisabled_doesNotPost() {
    props.getReconciliation().getNotify().setEnabled(false);
    props.getReconciliation().getNotify().setWebhookUrl("https://example.test/hook");

    notifier.notifyUnbalancedIfConfigured(LocalDate.parse("2026-06-16"), sampleReport());

    verify(restClient, never()).post();
  }

  @Test
  void notifyUnbalancedIfConfigured_feishu_postsTextPayload() {
    props.getReconciliation().getNotify().setEnabled(true);
    props.getReconciliation().getNotify().setWebhookUrl("https://open.feishu.cn/hook/demo");
    props.getReconciliation().getNotify().setProvider("feishu");
    when(restClient.post()).thenReturn(requestBodyUriSpec);
    when(requestBodyUriSpec.uri("https://open.feishu.cn/hook/demo")).thenReturn(requestBodySpec);
    when(requestBodySpec.contentType(MediaType.APPLICATION_JSON)).thenReturn(requestBodySpec);
    when(requestBodySpec.body(any(String.class))).thenReturn(requestBodySpec);
    when(requestBodySpec.retrieve()).thenReturn(responseSpec);

    notifier.notifyUnbalancedIfConfigured(LocalDate.parse("2026-06-16"), sampleReport());

    var bodyCaptor = ArgumentCaptor.forClass(String.class);
    verify(requestBodySpec).body(bodyCaptor.capture());
    assertThat(bodyCaptor.getValue()).contains("\"msg_type\":\"text\"");
    assertThat(bodyCaptor.getValue()).contains("paid_order_count_mismatch");
  }

  @Test
  void buildBody_generic_emitsEventPayload() throws Exception {
    var body =
        notifier.buildBody(
            "generic", LocalDate.parse("2026-06-16"), sampleReport());
    assertThat(body).contains("\"event\":\"billing.reconciliation.unbalanced\"");
    assertThat(body).contains("\"discrepancyCount\":1");
  }

  @Test
  void buildFeishuText_includesDateAndDiscrepancies() {
    var text = ReconciliationAlertNotifier.buildFeishuText(LocalDate.parse("2026-06-16"), sampleReport());
    assertThat(text).contains("UTC 日期：2026-06-16");
    assertThat(text).contains("paid_order_count_mismatch");
  }

  private static AdminReconciliationDailyResponse sampleReport() {
    return new AdminReconciliationDailyResponse(
        LocalDate.parse("2026-06-16"),
        Instant.parse("2026-06-16T00:00:00Z"),
        Instant.parse("2026-06-17T00:00:00Z"),
        1,
        500,
        4900,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        false,
        List.of("paid_order_count_mismatch: orders=1 ledger=0"));
  }
}
