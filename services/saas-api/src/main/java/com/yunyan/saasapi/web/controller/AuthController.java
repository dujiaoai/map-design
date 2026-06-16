package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.AcceptInviteRequest;
import com.yunyan.saasapi.web.dto.auth.InviteLinkPreviewResponse;
import com.yunyan.saasapi.web.dto.auth.JoinViaInviteLinkRequest;
import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import com.yunyan.saasapi.web.dto.auth.LoginMfaVerifyRequest;
import com.yunyan.saasapi.web.dto.auth.LoginRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.RefreshRequest;
import com.yunyan.saasapi.web.dto.auth.PasswordResetConfirmRequest;
import com.yunyan.saasapi.web.dto.auth.PasswordResetRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterConfirmRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterResendRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterOrgRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterOrgResponse;
import com.yunyan.saasapi.web.dto.auth.RegisterPersonalRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterPersonalResponse;
import com.yunyan.saasapi.web.dto.auth.RegisterRequest;
import com.yunyan.saasapi.web.support.ClientIpResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/register")
  @Operation(
      summary = "提交注册并发送验证邮件",
      description =
          "在已有租户下创建待验证账号（status=unverified）并发送邮箱验证链接。验证前无法登录。")
  @ApiResponse(responseCode = "204", description = "验证邮件已发送（或已重新发送）")
  @ApiResponse(
      responseCode = "404",
      description = "租户 slug 不存在",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "409",
      description = "该租户下邮箱已注册",
      content = @Content(mediaType = "application/problem+json"))
  ResponseEntity<Void> register(
      @Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
    authService.requestRegistration(request, ClientIpResolver.resolve(httpRequest));
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }

  @PostMapping("/register-org")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "自助创建组织并注册首个管理员",
      description =
          "创建新租户、首个 TENANT_ADMIN 账号（unverified）并发送邮箱验证链接。需配置 saas.registration.allow-public-org-signup=true。")
  @ApiResponse(responseCode = "201", description = "组织已创建，验证邮件已发送")
  @ApiResponse(
      responseCode = "403",
      description = "公开组织注册已关闭",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "409",
      description = "无法分配组织标识",
      content = @Content(mediaType = "application/problem+json"))
  RegisterOrgResponse registerOrg(
      @Valid @RequestBody RegisterOrgRequest request, HttpServletRequest httpRequest) {
    return authService.requestOrgRegistration(request, ClientIpResolver.resolve(httpRequest));
  }

  @PostMapping("/register-personal")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(
      summary = "自助注册个人版",
      description =
          "创建 personal 租户、MEMBER 账号（unverified）并发送邮箱验证链接。需配置 saas.registration.allow-public-personal-signup=true。")
  @ApiResponse(responseCode = "201", description = "个人空间已创建，验证邮件已发送")
  @ApiResponse(
      responseCode = "403",
      description = "公开个人注册已关闭",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "409",
      description = "该邮箱已有个人空间或无法分配标识",
      content = @Content(mediaType = "application/problem+json"))
  RegisterPersonalResponse registerPersonal(
      @Valid @RequestBody RegisterPersonalRequest request, HttpServletRequest httpRequest) {
    return authService.requestPersonalRegistration(request, ClientIpResolver.resolve(httpRequest));
  }

  @PostMapping("/register/confirm")
  @Operation(
      summary = "确认注册邮箱验证",
      description = "使用邮件 token 激活账号，响应体同登录。")
  LoginResponse confirmRegistration(@Valid @RequestBody RegisterConfirmRequest request) {
    return authService.confirmRegistration(request);
  }

  @PostMapping("/register/resend")
  @Operation(
      summary = "重发注册验证邮件",
      description =
          "若邮箱在指定租户下存在且 status=unverified，将发送新的验证链接。无论是否存在均返回 204，防止邮箱枚举。")
  @ApiResponse(responseCode = "204", description = "请求已受理")
  ResponseEntity<Void> resendRegistrationVerification(
      @Valid @RequestBody RegisterResendRequest request, HttpServletRequest httpRequest) {
    authService.resendRegistrationVerification(request, ClientIpResolver.resolve(httpRequest));
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }

  @PostMapping("/login")
  @Operation(
      summary = "邮箱密码登录",
      description = "成功返回 access/refresh token 与用户摘要。多租户下同邮箱需传 `tenantId`（租户 slug）。")
  @ApiResponse(responseCode = "200", description = "登录成功")
  @ApiResponse(
      responseCode = "401",
      description = "邮箱或密码错误",
      content = @Content(mediaType = "application/problem+json"))
  LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
    return authService.login(request, ClientIpResolver.resolve(httpRequest));
  }

  @PostMapping("/login/mfa")
  @Operation(
      summary = "登录 MFA step-up",
      description = "密码验证通过后、已绑定 TOTP 的平台管理员须提交 challenge token 与 6 位码换取 token 对。")
  LoginResponse verifyLoginMfa(@Valid @RequestBody LoginMfaVerifyRequest request) {
    return authService.verifyLoginMfa(request);
  }

  @PostMapping("/accept-invite")
  @Operation(
      summary = "接受邀请并设置密码",
      description = "使用邮件中的 token 设置密码并激活账号，响应体同登录。")
  LoginResponse acceptInvite(@Valid @RequestBody AcceptInviteRequest request) {
    return authService.acceptInvite(request);
  }

  @GetMapping("/invite-links/preview")
  @Operation(
      summary = "预览邀请链接",
      description = "公开接口，用于加入页展示租户名称与链接有效性。")
  InviteLinkPreviewResponse previewInviteLink(@RequestParam("token") String token) {
    return authService.previewInviteLink(token);
  }

  @PostMapping("/join-via-invite-link")
  @Operation(
      summary = "通过邀请链接加入租户",
      description = "使用可分享邀请链接注册并登录，响应体同登录。")
  LoginResponse joinViaInviteLink(
      @Valid @RequestBody JoinViaInviteLinkRequest request, HttpServletRequest httpRequest) {
    return authService.joinViaInviteLink(request, ClientIpResolver.resolve(httpRequest));
  }

  @PostMapping("/password-reset/request")
  @Operation(
      summary = "请求密码重置邮件",
      description = "若邮箱在指定租户下存在且为活跃账号，将发送重置链接。无论是否存在均返回 204，防止邮箱枚举。")
  @ApiResponse(responseCode = "204", description = "请求已受理")
  ResponseEntity<Void> requestPasswordReset(
      @Valid @RequestBody PasswordResetRequest request, HttpServletRequest httpRequest) {
    authService.requestPasswordReset(request, ClientIpResolver.resolve(httpRequest));
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }

  @PostMapping("/password-reset/confirm")
  @Operation(
      summary = "确认密码重置",
      description = "使用邮件 token 设置新密码，吊销既有 refresh token 并返回登录态。")
  LoginResponse confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
    return authService.confirmPasswordReset(request);
  }

  @PostMapping("/refresh")
  @Operation(summary = "刷新 access token", description = "使用 refresh token 换取新的 token 对；旧 refresh 随即失效（rotation）。")
  @ApiResponse(responseCode = "200", description = "刷新成功", content = @Content)
  @ApiResponse(
      responseCode = "400",
      description = "请求体验证失败",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "401",
      description = "refresh token 无效或已吊销",
      content = @Content(mediaType = "application/problem+json"))
  AuthTokensDto refresh(@Valid @RequestBody RefreshRequest request) {
    return authService.refresh(request);
  }

  @PostMapping("/logout")
  @Operation(
      summary = "登出",
      description =
          """
          吊销服务端 refresh token，并将当前 Bearer access token 的 jti 写入 Redis denylist（TTL = access 剩余有效期）。
          登出后同一 access token 不可再访问受保护接口；未登出的 access token 在过期前仍可用（stateless JWT，默认 TTL 15 分钟）。""")
  @SecurityRequirement(name = "bearerAuth")
  @ApiResponse(responseCode = "204", description = "已登出")
  @ApiResponse(
      responseCode = "401",
      description = "未提供有效 access token",
      content = @Content(mediaType = "application/problem+json"))
  ResponseEntity<Void> logout(@AuthenticationPrincipal SaasPrincipal principal) {
    authService.logout(principal);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }
}
