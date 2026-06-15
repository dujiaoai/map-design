package com.yunyan.billingapi.application.payment.sdk;

import com.wechat.pay.java.core.Config;
import com.wechat.pay.java.core.RSAAutoCertificateConfig;
import com.wechat.pay.java.core.exception.ServiceException;
import com.wechat.pay.java.service.payments.h5.H5Service;
import com.wechat.pay.java.service.payments.jsapi.JsapiServiceExtension;
import com.wechat.pay.java.service.payments.jsapi.model.PrepayWithRequestPaymentResponse;
import com.wechat.pay.java.service.payments.model.Transaction;
import com.wechat.pay.java.service.payments.model.Transaction.TradeStateEnum;
import com.wechat.pay.java.service.payments.nativepay.NativePayService;
import com.wechat.pay.java.service.payments.nativepay.model.PrepayResponse;
import com.wechat.pay.java.service.payments.nativepay.model.QueryOrderByOutTradeNoRequest;
import com.wechat.pay.java.service.refund.RefundService;
import com.wechat.pay.java.service.refund.model.AmountReq;
import com.wechat.pay.java.service.refund.model.CreateRequest;
import com.wechat.pay.java.service.refund.model.Refund;
import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class DefaultWechatPaySdkClient implements WechatPaySdkClient {

  private final BillingAppProperties billingAppProperties;
  private volatile Config cachedConfig;

  public DefaultWechatPaySdkClient(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  @Override
  public SdkCreateOrderResult createOrder(SdkCreateOrderRequest request) {
    var wechat = billingAppProperties.getPayment().getWechat();
    var config = requireConfig();
    var payScene = request.payScene() != null ? request.payScene() : PaymentPayScene.NATIVE;

    return switch (payScene) {
      case NATIVE ->
          createNativeOrder(
              config, wechat.getAppId(), wechat.getMchId(), request, payScene);
      case H5 -> createH5Order(config, wechat.getAppId(), wechat.getMchId(), request, payScene);
      case JSAPI ->
          createJsapiOrder(
              config, wechat.getAppId(), wechat.getMchId(), request, payScene);
      case WAP -> throw AuthException.badRequest("WeChat Pay does not support wap pay scene");
    };
  }

  @Override
  public SdkQueryOrderResult queryByOutTradeNo(String outTradeNo) {
    var wechat = billingAppProperties.getPayment().getWechat();
    var config = requireConfig();
    var service = new NativePayService.Builder().config(config).build();
    var queryRequest = new QueryOrderByOutTradeNoRequest();
    queryRequest.setMchid(wechat.getMchId());
    queryRequest.setOutTradeNo(outTradeNo);

    try {
      Transaction transaction = service.queryOrderByOutTradeNo(queryRequest);
      if (transaction.getTradeState() != TradeStateEnum.SUCCESS) {
        return SdkQueryOrderResult.unpaid();
      }
      var total =
          transaction.getAmount() != null && transaction.getAmount().getTotal() != null
              ? transaction.getAmount().getTotal().longValue()
              : 0L;
      var tradeNo =
          StringUtils.hasText(transaction.getTransactionId())
              ? transaction.getTransactionId()
              : outTradeNo;
      return new SdkQueryOrderResult(true, tradeNo, total);
    } catch (ServiceException ex) {
      if ("ORDER_NOT_EXIST".equals(ex.getErrorCode()) || "ORDER_NOT_EXISTS".equals(ex.getErrorCode())) {
        return SdkQueryOrderResult.unpaid();
      }
      throw sdkError("WeChat Pay query failed", ex);
    }
  }

  @Override
  public SdkRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    var config = requireConfig();
    var service = new RefundService.Builder().config(config).build();
    var amount = new AmountReq();
    amount.setRefund(priceCents);
    amount.setTotal(priceCents);
    amount.setCurrency(StringUtils.hasText(currency) ? currency : "CNY");
    var request = new CreateRequest();
    request.setOutTradeNo(orderNo);
    request.setOutRefundNo("refund-" + orderNo);
    request.setReason("Platform admin refund");
    request.setAmount(amount);
    try {
      Refund response = service.create(request);
      var refundNo =
          StringUtils.hasText(response.getRefundId())
              ? response.getRefundId()
              : "wx-refund-" + orderNo;
      return new SdkRefundResult(refundNo, false);
    } catch (ServiceException ex) {
      throw sdkError("WeChat Pay refund failed", ex);
    }
  }

  private SdkCreateOrderResult createNativeOrder(
      Config config,
      String appId,
      String mchId,
      SdkCreateOrderRequest request,
      PaymentPayScene payScene) {
    var service = new NativePayService.Builder().config(config).build();
    var prepayRequest = new com.wechat.pay.java.service.payments.nativepay.model.PrepayRequest();
    prepayRequest.setAppid(appId);
    prepayRequest.setMchid(mchId);
    prepayRequest.setDescription(request.description());
    prepayRequest.setOutTradeNo(request.orderNo());
    prepayRequest.setNotifyUrl(request.notifyUrl());
    prepayRequest.setAmount(buildNativeAmount(request));
    try {
      PrepayResponse response = service.prepay(prepayRequest);
      return new SdkCreateOrderResult(
          "wx-" + request.orderNo(), response.getCodeUrl(), payScene.wireValue());
    } catch (ServiceException ex) {
      throw sdkError("WeChat Pay Native prepay failed", ex);
    }
  }

  private SdkCreateOrderResult createH5Order(
      Config config,
      String appId,
      String mchId,
      SdkCreateOrderRequest request,
      PaymentPayScene payScene) {
    var service = new H5Service.Builder().config(config).build();
    var prepayRequest = new com.wechat.pay.java.service.payments.h5.model.PrepayRequest();
    prepayRequest.setAppid(appId);
    prepayRequest.setMchid(mchId);
    prepayRequest.setDescription(request.description());
    prepayRequest.setOutTradeNo(request.orderNo());
    prepayRequest.setNotifyUrl(request.notifyUrl());
    prepayRequest.setAmount(buildH5Amount(request));
    var sceneInfo = new com.wechat.pay.java.service.payments.h5.model.SceneInfo();
    var h5Info = new com.wechat.pay.java.service.payments.h5.model.H5Info();
    h5Info.setType("Wap");
    sceneInfo.setH5Info(h5Info);
    prepayRequest.setSceneInfo(sceneInfo);
    try {
      var response = service.prepay(prepayRequest);
      return new SdkCreateOrderResult(
          "wx-" + request.orderNo(), response.getH5Url(), payScene.wireValue());
    } catch (ServiceException ex) {
      throw sdkError("WeChat Pay H5 prepay failed", ex);
    }
  }

  private SdkCreateOrderResult createJsapiOrder(
      Config config,
      String appId,
      String mchId,
      SdkCreateOrderRequest request,
      PaymentPayScene payScene) {
    if (!StringUtils.hasText(request.wechatOpenId())) {
      throw AuthException.badRequest("wechatOpenId is required for JSAPI pay scene");
    }
    var service = new JsapiServiceExtension.Builder().config(config).build();
    var prepayRequest = new com.wechat.pay.java.service.payments.jsapi.model.PrepayRequest();
    prepayRequest.setAppid(appId);
    prepayRequest.setMchid(mchId);
    prepayRequest.setDescription(request.description());
    prepayRequest.setOutTradeNo(request.orderNo());
    prepayRequest.setNotifyUrl(request.notifyUrl());
    prepayRequest.setAmount(buildJsapiAmount(request));
    var payer = new com.wechat.pay.java.service.payments.jsapi.model.Payer();
    payer.setOpenid(request.wechatOpenId().trim());
    prepayRequest.setPayer(payer);
    try {
      PrepayWithRequestPaymentResponse response = service.prepayWithRequestPayment(prepayRequest);
      return new SdkCreateOrderResult(
          "wx-" + request.orderNo(), buildJsapiLaunchUrl(response), payScene.wireValue());
    } catch (ServiceException ex) {
      throw sdkError("WeChat Pay JSAPI prepay failed", ex);
    }
  }

  private static com.wechat.pay.java.service.payments.nativepay.model.Amount buildNativeAmount(
      SdkCreateOrderRequest request) {
    var amount = new com.wechat.pay.java.service.payments.nativepay.model.Amount();
    amount.setTotal(Math.toIntExact(request.priceCents()));
    amount.setCurrency(StringUtils.hasText(request.currency()) ? request.currency() : "CNY");
    return amount;
  }

  private static com.wechat.pay.java.service.payments.h5.model.Amount buildH5Amount(
      SdkCreateOrderRequest request) {
    var amount = new com.wechat.pay.java.service.payments.h5.model.Amount();
    amount.setTotal(Math.toIntExact(request.priceCents()));
    amount.setCurrency(StringUtils.hasText(request.currency()) ? request.currency() : "CNY");
    return amount;
  }

  private static com.wechat.pay.java.service.payments.jsapi.model.Amount buildJsapiAmount(
      SdkCreateOrderRequest request) {
    var amount = new com.wechat.pay.java.service.payments.jsapi.model.Amount();
    amount.setTotal(Math.toIntExact(request.priceCents()));
    amount.setCurrency(StringUtils.hasText(request.currency()) ? request.currency() : "CNY");
    return amount;
  }

  private Config requireConfig() {
    if (cachedConfig != null) {
      return cachedConfig;
    }
    synchronized (this) {
      if (cachedConfig != null) {
        return cachedConfig;
      }
      var wechat = billingAppProperties.getPayment().getWechat();
      var privateKey = PaymentSdkPemUtil.normalizePem(wechat.getPrivateKeyPem());
      cachedConfig =
          new RSAAutoCertificateConfig.Builder()
              .merchantId(wechat.getMchId())
              .privateKey(privateKey)
              .merchantSerialNumber(wechat.getMerchantSerialNo())
              .apiV3Key(wechat.getApiV3Key())
              .build();
      return cachedConfig;
    }
  }

  private static String buildJsapiLaunchUrl(PrepayWithRequestPaymentResponse response) {
    var query =
        "appId="
            + encode(response.getAppId())
            + "&timeStamp="
            + encode(response.getTimeStamp())
            + "&nonceStr="
            + encode(response.getNonceStr())
            + "&package="
            + encode(response.getPackageVal())
            + "&signType="
            + encode(response.getSignType())
            + "&paySign="
            + encode(response.getPaySign());
    return "weixin://jsapi?" + query;
  }

  private static String encode(String value) {
    return URLEncoder.encode(value != null ? value : "", StandardCharsets.UTF_8);
  }

  private static AuthException sdkError(String message, ServiceException ex) {
    return new AuthException(
        HttpStatus.BAD_GATEWAY,
        message + ": " + ex.getErrorCode() + " " + ex.getErrorMessage());
  }
}
