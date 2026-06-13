package com.yunyan.saasapi.application.auth;

public enum LoginLookupStatus {
  FOUND,
  NOT_FOUND,
  TENANT_SUSPENDED,
  ACCOUNT_DISABLED,
  INVITE_PENDING,
  EMAIL_VERIFICATION_PENDING
}
