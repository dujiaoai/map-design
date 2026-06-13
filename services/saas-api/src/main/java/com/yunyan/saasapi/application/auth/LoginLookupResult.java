package com.yunyan.saasapi.application.auth;

public record LoginLookupResult(LoginLookupStatus status, AuthenticatedUser user) {

  public static LoginLookupResult found(AuthenticatedUser user) {
    return new LoginLookupResult(LoginLookupStatus.FOUND, user);
  }

  public static LoginLookupResult accountDisabled(AuthenticatedUser user) {
    return new LoginLookupResult(LoginLookupStatus.ACCOUNT_DISABLED, user);
  }

  public static LoginLookupResult notFound() {
    return new LoginLookupResult(LoginLookupStatus.NOT_FOUND, null);
  }

  public static LoginLookupResult tenantSuspended() {
    return new LoginLookupResult(LoginLookupStatus.TENANT_SUSPENDED, null);
  }
}
