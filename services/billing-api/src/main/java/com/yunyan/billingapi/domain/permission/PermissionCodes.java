package com.yunyan.billingapi.domain.permission;

public final class PermissionCodes {

  public static final String BILLING_WALLET_READ = "billing:wallet:read";
  public static final String BILLING_LEDGER_READ = "billing:ledger:read";
  public static final String BILLING_RECHARGE_CREATE = "billing:recharge:create";
  public static final String BILLING_USAGE_READ = "billing:usage:read";
  public static final String BILLING_TRANSFER_CREATE = "billing:transfer:create";
  public static final String ADMIN_BILLING_READ = "admin:billing:read";
  public static final String ADMIN_BILLING_ADJUST = "admin:billing:adjust";
  public static final String ADMIN_BILLING_PACKAGES_WRITE = "admin:billing:packages:write";
  public static final String ADMIN_BILLING_REFUND = "admin:billing:refund";

  private PermissionCodes() {}
}
