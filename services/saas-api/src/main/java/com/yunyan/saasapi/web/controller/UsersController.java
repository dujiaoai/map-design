package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.UpdateUserRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users")
@SecurityRequirement(name = "bearerAuth")
public class UsersController {

  private final AuthService authService;

  @GetMapping("/me")
  @Operation(
      summary = "获取当前登录用户与会话信息",
      description = "`expiresAt` 为 access token 过期时间（毫秒 epoch），取自 JWT `exp`。")
  @ApiResponse(responseCode = "200", description = "当前会话（user、tenant、expiresAt）")
  @ApiResponse(
      responseCode = "401",
      description = "未认证或 token 无效",
      content = @Content(mediaType = "application/problem+json"))
  public SessionDto me(@AuthenticationPrincipal SaasPrincipal principal) {
    return authService.getCurrentSession(principal);
  }

  @PutMapping("/me")
  @Operation(
      summary = "更新当前用户资料",
      description = "首版仅支持修改 `name`（显示名）；返回更新后的完整 SessionDto。")
  @ApiResponse(responseCode = "200", description = "更新成功，返回当前会话")
  @ApiResponse(
      responseCode = "400",
      description = "请求体验证失败",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "401",
      description = "未认证或 token 无效",
      content = @Content(mediaType = "application/problem+json"))
  public SessionDto updateMe(
      @AuthenticationPrincipal SaasPrincipal principal, @Valid @RequestBody UpdateUserRequest request) {
    return authService.updateCurrentUser(principal, request);
  }
}
