package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.AuthService;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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
  @Operation(summary = "获取当前登录用户与会话信息")
  public SessionDto me(@AuthenticationPrincipal SaasPrincipal principal) {
    return authService.getCurrentSession(principal);
  }
}
