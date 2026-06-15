package com.yunyan.billingapi.application.payment.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.billingapi.application.payment.sdk.WechatPaySdkClient;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LiveWechatPaymentProviderTest {

  @Mock WechatPaySdkClient wechatPaySdkClient;
  private LiveWechatPaymentProvider provider;
  private final BillingAppProperties props = new BillingAppProperties();

  @BeforeEach
  void setUp() {
    props.getPayment().getWechat().setAppId("wx_test");
    props.getPayment().getWechat().setMchId("1900000109");
    props.getPayment().getWechat().setApiV3Key("test-api-v3-key-32chars-min!!");
    props.getPayment().getWechat().setMerchantSerialNo("5157F09EFDC096DE15EBE81A47057A72");
    props.getPayment().getWechat().setPrivateKeyPem("-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----");
    props.getPayment().getWechat().setNotifyUrl("https://billing.example/v1/billing/webhooks/wechat");
    provider = new LiveWechatPaymentProvider(props, wechatPaySdkClient);
  }

  @Test
  void createPayment_whenConfigured_delegatesToSdk() {
    when(wechatPaySdkClient.createOrder(any()))
        .thenReturn(
            new WechatPaySdkClient.SdkCreateOrderResult(
                "wx-RO-LIVE", "weixin://wxpay/bizpayurl?pr=abc", "h5"));

    var result =
        provider.createPayment(
            new PaymentCreateCommand("RO-LIVE", 3900L, "CNY", "starter_500", PaymentPayScene.H5));

    assertThat(result.providerTradeNo()).isEqualTo("wx-RO-LIVE");
    assertThat(result.payUrl()).contains("weixin://");
    assertThat(result.payScene()).isEqualTo("h5");
    verify(wechatPaySdkClient).createOrder(any());
  }

  @Test
  void createPayment_missingCredentials_throwsBadRequest() {
    var unconfigured = new LiveWechatPaymentProvider(new BillingAppProperties(), wechatPaySdkClient);

    assertThatThrownBy(
            () ->
                unconfigured.createPayment(
                    new PaymentCreateCommand("RO-LIVE", 3900L, "CNY", "starter_500")))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("WeChat Pay live mode requires");
  }
}
