package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.auth.UserAuthRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import com.yunyan.saasapi.web.dto.auth.SessionUserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UsersController {

  private final UserAuthRepository userAuthRepository;

  @GetMapping("/me")
  SessionDto me(@AuthenticationPrincipal SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var user = userAuthRepository
        .findById(principal.userId())
        .orElseThrow(() -> AuthException.unauthorized("User not found"));

    return new SessionDto(
        new SessionUserDto(
            user.id().toString(),
            user.email(),
            user.displayName(),
            user.roleCodes()),
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug()),
        0);
  }
}
