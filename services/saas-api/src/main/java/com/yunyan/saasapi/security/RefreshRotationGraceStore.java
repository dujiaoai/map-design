package com.yunyan.saasapi.security;

import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

public interface RefreshRotationGraceStore {

  void store(UUID userId, String consumedJti, AuthTokensDto tokens, Duration ttl);

  Optional<AuthTokensDto> find(UUID userId, String consumedJti);
}
