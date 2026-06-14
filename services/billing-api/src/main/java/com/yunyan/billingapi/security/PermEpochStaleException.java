package com.yunyan.billingapi.security;

public final class PermEpochStaleException extends RuntimeException {

  public static final String PROBLEM_TYPE = "urn:yunyan:auth:perm_epoch_stale";

  private PermEpochStaleException() {
    super("JWT perm_epoch is stale; refresh tokens or sign in again");
  }

  public static PermEpochStaleException create() {
    return new PermEpochStaleException();
  }
}
