package com.yunyan.billingapi.application.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.web.dto.WechatOAuthConfigResponse;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class WechatOAuthService {

  private static final String OAUTH_ACCESS_TOKEN_URL =
      "https://api.weixin.qq.com/sns/oauth2/access_token?appid={appId}&secret={appSecret}&code={code}&grant_type=authorization_code";

  private final BillingAppProperties billingAppProperties;
  private final RestClient restClient;
  private final ObjectMapper objectMapper;

  public WechatOAuthService(
      BillingAppProperties billingAppProperties, RestClient restClient, ObjectMapper objectMapper) {
    this.billingAppProperties = billingAppProperties;
    this.restClient = restClient;
    this.objectMapper = objectMapper;
  }

  public WechatOAuthConfigResponse getConfig() {
    var wechat = billingAppProperties.getPayment().getWechat();
    var enabled =
        StringUtils.hasText(wechat.getAppId()) && StringUtils.hasText(wechat.getAppSecret());
    return new WechatOAuthConfigResponse(
        StringUtils.hasText(wechat.getAppId()) ? wechat.getAppId() : "", enabled);
  }

  public String exchangeCodeForOpenId(String code) {
    if (!StringUtils.hasText(code)) {
      throw AuthException.badRequest("code is required");
    }
    var wechat = billingAppProperties.getPayment().getWechat();
    if (!StringUtils.hasText(wechat.getAppId()) || !StringUtils.hasText(wechat.getAppSecret())) {
      throw AuthException.badRequest(
          "WeChat OAuth requires billing.payment.wechat.app-id and app-secret");
    }

    try {
      var body =
          restClient
              .get()
              .uri(
                  URI.create(
                      OAUTH_ACCESS_TOKEN_URL
                          .replace("{appId}", wechat.getAppId())
                          .replace("{appSecret}", wechat.getAppSecret())
                          .replace("{code}", code.trim())))
              .retrieve()
              .body(String.class);
      var json = objectMapper.readTree(body != null ? body : "{}");
      assertWechatSuccess(json);
      var openId = json.path("openid").asText(null);
      if (!StringUtils.hasText(openId)) {
        throw new AuthException(HttpStatus.BAD_GATEWAY, "WeChat OAuth response missing openid");
      }
      return openId.trim();
    } catch (RestClientException ex) {
      throw new AuthException(HttpStatus.BAD_GATEWAY, "WeChat OAuth request failed: " + ex.getMessage());
    } catch (java.io.IOException ex) {
      throw new AuthException(HttpStatus.BAD_GATEWAY, "WeChat OAuth response parse failed");
    }
  }

  private static void assertWechatSuccess(JsonNode json) {
    if (json.hasNonNull("errcode") && json.get("errcode").asInt() != 0) {
      throw new AuthException(
          HttpStatus.BAD_GATEWAY,
          "WeChat OAuth failed: "
              + json.path("errcode").asInt()
              + " "
              + json.path("errmsg").asText(""));
    }
  }
}
