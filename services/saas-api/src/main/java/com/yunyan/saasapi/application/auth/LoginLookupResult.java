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

  public static LoginLookupResult tenantRequired() {
    return new LoginLookupResult(LoginLookupStatus.TENANT_REQUIRED, null);
  }

  public static LoginLookupResult tenantSuspended() {
    return new LoginLookupResult(LoginLookupStatus.TENANT_SUSPENDED, null);
  }

  public static LoginLookupResult invitePending(AuthenticatedUser user) {
    return new LoginLookupResult(LoginLookupStatus.INVITE_PENDING, user);
  }

  public static LoginLookupResult emailVerificationPending(AuthenticatedUser user) {
    return new LoginLookupResult(LoginLookupStatus.EMAIL_VERIFICATION_PENDING, user);
  }
}
