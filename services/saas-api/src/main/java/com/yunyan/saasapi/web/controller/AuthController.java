package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import com.yunyan.saasapi.web.dto.auth.LoginRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.RefreshRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {

  private final AuthService authService;

  @PostMapping("/login")
  @Operation(
      summary = "邮箱密码登录",
      description = "成功返回 access/refresh token 与用户摘要。多租户下同邮箱需传 `tenantId`（租户 slug）。")
  @ApiResponse(responseCode = "200", description = "登录成功")
  @ApiResponse(
      responseCode = "401",
      description = "邮箱或密码错误",
      content = @Content(mediaType = "application/problem+json"))
  LoginResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
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
      description = "吊销服务端 refresh token。需 Bearer access token；前端 `@repo/auth` 在登出时携带当前 accessToken。")
  @SecurityRequirement(name = "bearerAuth")
  @ApiResponse(responseCode = "204", description = "已登出")
  @ApiResponse(
      responseCode = "401",
      description = "未提供有效 access token",
      content = @Content(mediaType = "application/problem+json"))
  ResponseEntity<Void> logout(@AuthenticationPrincipal SaasPrincipal principal) {
    if (principal != null) {
      authService.logout(principal.userId());
    }
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
  }
}
