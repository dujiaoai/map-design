package com.yunyan.billingapi.domain.tenant;

public final class TenantFeatureCodes {

  /** 租户启用后禁止普通成员自助充值（TENANT_ADMIN 不受影响；默认未启用=允许）。 */
  public static final String MEMBERS_RECHARGE_DISABLED = "billing.members-recharge-disabled";

  private TenantFeatureCodes() {}
}
