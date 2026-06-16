package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;

@Schema(description = "当前用户 OIDC/ OAuth 绑定列表")
public record UserOauthBindsResponse(List<UserOauthBindItemDto> binds) {

  @Schema(description = "单条 IdP 绑定")
  public record UserOauthBindItemDto(
      String providerId,
      String providerDisplayName,
      String emailSnapshot,
      Instant createdAt,
      Instant lastUsedAt) {}
}
