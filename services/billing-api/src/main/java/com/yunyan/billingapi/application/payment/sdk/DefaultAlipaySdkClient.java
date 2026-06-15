package com.yunyan.billingapi.application.payment.sdk;

import com.alipay.api.AlipayApiException;
import com.alipay.api.AlipayClient;
import com.alipay.api.AlipayConfig;
import com.alipay.api.DefaultAlipayClient;
import com.alipay.api.domain.AlipayTradeQueryModel;
import com.alipay.api.domain.AlipayTradeWapPayModel;
import com.alipay.api.domain.AlipayTradeRefundModel;
import com.alipay.api.request.AlipayTradeRefundRequest;
import com.alipay.api.response.AlipayTradeRefundResponse;
import com.alipay.api.request.AlipayTradeQueryRequest;
import com.alipay.api.request.AlipayTradeWapPayRequest;
import com.alipay.api.response.AlipayTradeQueryResponse;
import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class DefaultAlipaySdkClient implements AlipaySdkClient {

  private final BillingAppProperties billingAppProperties;
  private volatile AlipayClient cachedClient;

  public DefaultAlipaySdkClient(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  @Override
  public SdkCreateOrderResult createOrder(SdkCreateOrderRequest request) {
    var payScene = request.payScene() != null ? request.payScene() : PaymentPayScene.WAP;
    if (payScene != PaymentPayScene.WAP) {
      throw AuthException.badRequest("Alipay live mode currently supports wap pay scene only");
    }

    var wapRequest = new AlipayTradeWapPayRequest();
    wapRequest.setNotifyUrl(request.notifyUrl());
    var model = new AlipayTradeWapPayModel();
    model.setOutTradeNo(request.orderNo());
    model.setTotalAmount(formatAmount(request.priceCents()));
    model.setSubject(request.subject());
    model.setProductCode("QUICK_WAP_WAY");
    wapRequest.setBizModel(model);

    try {
      var response = requireClient().pageExecute(wapRequest, "GET");
      return new SdkCreateOrderResult(
          "alipay-" + request.orderNo(), response.getBody(), payScene.wireValue());
    } catch (AlipayApiException ex) {
      throw sdkError("Alipay WAP prepay failed", ex);
    }
  }

  @Override
  public SdkQueryOrderResult queryByOutTradeNo(String outTradeNo) {
    var queryRequest = new AlipayTradeQueryRequest();
    var model = new AlipayTradeQueryModel();
    model.setOutTradeNo(outTradeNo);
    queryRequest.setBizModel(model);

    try {
      AlipayTradeQueryResponse response = requireClient().execute(queryRequest);
      if (!response.isSuccess()) {
        if ("ACQ.TRADE_NOT_EXIST".equals(response.getSubCode())) {
          return SdkQueryOrderResult.unpaid();
        }
        throw sdkError("Alipay query failed", response.getSubCode(), response.getSubMsg());
      }
      var status = response.getTradeStatus();
      if (!"TRADE_SUCCESS".equals(status) && !"TRADE_FINISHED".equals(status)) {
        return SdkQueryOrderResult.unpaid();
      }
      var total = parseAmountCents(response.getTotalAmount());
      var tradeNo =
          StringUtils.hasText(response.getTradeNo()) ? response.getTradeNo() : outTradeNo;
      return new SdkQueryOrderResult(true, tradeNo, total);
    } catch (AlipayApiException ex) {
      throw sdkError("Alipay query failed", ex);
    }
  }

  @Override
  public SdkRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    var refundRequest = new AlipayTradeRefundRequest();
    var model = new AlipayTradeRefundModel();
    model.setOutTradeNo(orderNo);
    model.setRefundAmount(formatAmount(priceCents));
    model.setOutRequestNo("refund-" + orderNo);
    refundRequest.setBizModel(model);

    try {
      AlipayTradeRefundResponse response = requireClient().execute(refundRequest);
      if (!response.isSuccess()) {
        throw sdkError("Alipay refund failed", response.getSubCode(), response.getSubMsg());
      }
      var refundNo =
          StringUtils.hasText(response.getTradeNo())
              ? response.getTradeNo()
              : "alipay-refund-" + orderNo;
      return new SdkRefundResult(refundNo, false);
    } catch (AlipayApiException ex) {
      throw sdkError("Alipay refund failed", ex);
    }
  }

  private AlipayClient requireClient() {
    if (cachedClient != null) {
      return cachedClient;
    }
    synchronized (this) {
      if (cachedClient != null) {
        return cachedClient;
      }
      var alipay = billingAppProperties.getPayment().getAlipay();
      var config = new AlipayConfig();
      config.setServerUrl(alipay.getGatewayUrl());
      config.setAppId(alipay.getAppId());
      config.setPrivateKey(PaymentSdkPemUtil.normalizePem(alipay.getPrivateKeyPem()));
      config.setFormat("json");
      config.setCharset("UTF-8");
      config.setSignType("RSA2");
      config.setAlipayPublicKey(PaymentSdkPemUtil.normalizePem(alipay.getAlipayPublicKeyPem()));
      try {
        cachedClient = new DefaultAlipayClient(config);
      } catch (AlipayApiException ex) {
        throw sdkError("Alipay client init failed", ex);
      }
      return cachedClient;
    }
  }

  private static String formatAmount(long priceCents) {
    return BigDecimal.valueOf(priceCents, 2).setScale(2, RoundingMode.UNNECESSARY).toPlainString();
  }

  private static long parseAmountCents(String amountYuan) {
    if (!StringUtils.hasText(amountYuan)) {
      return 0L;
    }
    return new BigDecimal(amountYuan.trim())
        .movePointRight(2)
        .setScale(0, RoundingMode.HALF_UP)
        .longValue();
  }

  private static AuthException sdkError(String message, AlipayApiException ex) {
    return new AuthException(
        HttpStatus.BAD_GATEWAY, message + ": " + ex.getErrCode() + " " + ex.getErrMsg());
  }

  private static AuthException sdkError(String message, String code, String detail) {
    return new AuthException(HttpStatus.BAD_GATEWAY, message + ": " + code + " " + detail);
  }
}
