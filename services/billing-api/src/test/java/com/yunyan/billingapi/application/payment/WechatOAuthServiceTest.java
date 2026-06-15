package com.yunyan.billingapi.application.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

@ExtendWith(MockitoExtension.class)
class WechatOAuthServiceTest {

  @Mock RestClient restClient;
  @Mock RestClient.RequestHeadersUriSpec requestHeadersUriSpec;
  @Mock RestClient.ResponseSpec responseSpec;

  private final BillingAppProperties props = new BillingAppProperties();
  private WechatOAuthService service;

  @BeforeEach
  void setUp() {
    service = new WechatOAuthService(props, restClient, new ObjectMapper());
  }

  @Test
  void getConfig_whenCredentialsPresent_isEnabled() {
    props.getPayment().getWechat().setAppId("wx_test");
    props.getPayment().getWechat().setAppSecret("secret");

    var config = service.getConfig();

    assertThat(config.enabled()).isTrue();
    assertThat(config.appId()).isEqualTo("wx_test");
  }

  @Test
  void exchangeCodeForOpenId_parsesOpenId() {
    props.getPayment().getWechat().setAppId("wx_test");
    props.getPayment().getWechat().setAppSecret("secret");
    when(restClient.get()).thenReturn(requestHeadersUriSpec);
    when(requestHeadersUriSpec.uri(any(java.net.URI.class))).thenReturn(requestHeadersUriSpec);
    when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.body(String.class))
        .thenReturn("{\"openid\":\"oABC123\",\"access_token\":\"token\"}");

    assertThat(service.exchangeCodeForOpenId("oauth-code")).isEqualTo("oABC123");
  }

  @Test
  void exchangeCodeForOpenId_wechatError_throwsBadGateway() {
    props.getPayment().getWechat().setAppId("wx_test");
    props.getPayment().getWechat().setAppSecret("secret");
    when(restClient.get()).thenReturn(requestHeadersUriSpec);
    when(requestHeadersUriSpec.uri(any(java.net.URI.class))).thenReturn(requestHeadersUriSpec);
    when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.body(String.class)).thenReturn("{\"errcode\":40029,\"errmsg\":\"invalid code\"}");

    assertThatThrownBy(() -> service.exchangeCodeForOpenId("bad"))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("WeChat OAuth failed");
  }
}
