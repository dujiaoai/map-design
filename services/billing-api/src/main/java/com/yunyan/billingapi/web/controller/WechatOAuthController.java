package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.payment.WechatOAuthService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.web.dto.WechatOAuthConfigResponse;
import com.yunyan.billingapi.web.dto.WechatOpenIdResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing/wechat/oauth")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class WechatOAuthController {

  private final WechatOAuthService wechatOAuthService;

  public WechatOAuthController(WechatOAuthService wechatOAuthService) {
    this.wechatOAuthService = wechatOAuthService;
  }

  @GetMapping("/config")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "微信 JSAPI OAuth 公开配置（appId）")
  public WechatOAuthConfigResponse getConfig() {
    return wechatOAuthService.getConfig();
  }

  @GetMapping("/openid")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "用 OAuth code 换取 openId（snsapi_base）")
  public WechatOpenIdResponse exchangeOpenId(@RequestParam String code) {
    return new WechatOpenIdResponse(wechatOAuthService.exchangeCodeForOpenId(code));
  }
}
