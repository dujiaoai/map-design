package com.yunyan.saasapi.application.auth.oidc;

import java.time.Duration;
import java.util.Optional;

public interface OidcAuthorizationSessionStore {

  void store(OidcAuthorizationSession session, Duration ttl);

  Optional<OidcAuthorizationSession> consume(String state);
}
