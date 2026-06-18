package com.yunyan.saasapi.application.admin;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class AuditWebhookHttpClientTest {

  private MockRestServiceServer server;
  private AuditWebhookHttpClient client;

  @BeforeEach
  void setUp() {
    var builder = RestClient.builder().requestFactory(new SimpleClientHttpRequestFactory());
    server = MockRestServiceServer.bindTo(builder).build();
    client = new AuditWebhookHttpClient(builder);
  }

  @AfterEach
  void verifyServer() {
    server.verify();
  }

  @Test
  void postJson_successReturnsTrue() {
    server
        .expect(requestTo("https://siem.example/hook"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess());

    assertTrue(client.postJson("https://siem.example/hook", "{\"events\":[]}"));
  }

  @Test
  void postJson_withSignature_setsWebhookSignatureHeader() {
    server
        .expect(requestTo("https://siem.example/hook"))
        .andExpect(method(HttpMethod.POST))
        .andExpect(header(HttpHeaders.CONTENT_TYPE, "application/json"))
        .andExpect(header("X-Webhook-Signature", "sha256=deadbeef"))
        .andRespond(withSuccess());

    assertTrue(client.postJson("https://siem.example/hook", "{\"events\":[]}", "deadbeef"));
  }

  @Test
  void postJson_serverErrorReturnsFalse() {
    server
        .expect(requestTo("https://siem.example/hook"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withServerError());

    assertFalse(client.postJson("https://siem.example/hook", "{}"));
  }
}
