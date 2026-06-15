package com.yunyan.billingapi.application.payment.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.junit.jupiter.api.Test;

class LiveWechatPaymentProviderTest {

  @Test
  void createPayment_whenConfigured_returnsLivePendingUrl() {
    var props = new BillingAppProperties();
    props.getPayment().getWechat().setAppId("wx_test");
    props.getPayment().getWechat().setMchId("1900000109");
    props.getPayment().getWechat().setApiV3Key("test-api-v3-key-32chars-min!!");
    var provider = new LiveWechatPaymentProvider(props);

    var result =
        provider.createPayment(
            new PaymentCreateCommand("RO-LIVE", 3900L, "CNY", "starter_500", PaymentPayScene.H5));

    assertThat(result.providerTradeNo()).startsWith("wx-live-pending-");
    assertThat(result.payUrl()).contains("pending-sdk/h5");
    assertThat(result.payScene()).isEqualTo("h5");
  }

  @Test
  void createPayment_missingCredentials_throwsBadRequest() {
    var provider = new LiveWechatPaymentProvider(new BillingAppProperties());

    assertThatThrownBy(
            () ->
                provider.createPayment(
                    new PaymentCreateCommand("RO-LIVE", 3900L, "CNY", "starter_500")))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("WeChat Pay live mode requires");
  }
}
