package com.yunyan.billingapi.application.payment.provider;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.billingapi.config.BillingAppProperties;
import org.junit.jupiter.api.Test;

class StubWechatPaymentProviderTest {

  @Test
  void createPayment_h5Scene_returnsH5PayUrl() {
    var props = new BillingAppProperties();
    props.getPayment().getWechat().setDefaultPayScene("h5");
    var provider = new StubWechatPaymentProvider(props);

    var result =
        provider.createPayment(
            new PaymentCreateCommand("RO-TEST", 4900L, "CNY", "starter_500", PaymentPayScene.H5));

    assertThat(result.payUrl()).contains("/wechat/h5");
    assertThat(result.payScene()).isEqualTo("h5");
  }
}
