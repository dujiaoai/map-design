package com.yunyan.billingapi.application.payment.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.billingapi.application.payment.sdk.AlipaySdkClient;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LiveAlipayPaymentProviderTest {

  @Mock AlipaySdkClient alipaySdkClient;
  private LiveAlipayPaymentProvider provider;
  private final BillingAppProperties props = new BillingAppProperties();

  @BeforeEach
  void setUp() {
    props.getPayment().getAlipay().setAppId("2021000000000000");
    props.getPayment().getAlipay().setPrivateKeyPem("-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----");
    props.getPayment().getAlipay().setAlipayPublicKeyPem("-----BEGIN PUBLIC KEY-----\nTEST\n-----END PUBLIC KEY-----");
    props.getPayment().getAlipay().setNotifyUrl("https://billing.example/v1/billing/webhooks/alipay");
    provider = new LiveAlipayPaymentProvider(props, alipaySdkClient);
  }

  @Test
  void createPayment_whenConfigured_delegatesToSdk() {
    when(alipaySdkClient.createOrder(any()))
        .thenReturn(
            new AlipaySdkClient.SdkCreateOrderResult(
                "alipay-RO-LIVE", "https://openapi.alipay.com/gateway.do?...", "wap"));

    var result =
        provider.createPayment(
            new PaymentCreateCommand("RO-LIVE", 3900L, "CNY", "starter_500", PaymentPayScene.WAP));

    assertThat(result.providerTradeNo()).isEqualTo("alipay-RO-LIVE");
    assertThat(result.payUrl()).startsWith("https://");
    assertThat(result.payScene()).isEqualTo("wap");
    verify(alipaySdkClient).createOrder(any());
  }

  @Test
  void createPayment_missingCredentials_throwsBadRequest() {
    var unconfigured = new LiveAlipayPaymentProvider(new BillingAppProperties(), alipaySdkClient);

    assertThatThrownBy(
            () ->
                unconfigured.createPayment(
                    new PaymentCreateCommand("RO-LIVE", 3900L, "CNY", "starter_500")))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("Alipay live mode requires");
  }
}
