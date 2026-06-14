package com.yunyan.saasapi.domain.tenant;

import java.util.List;

/** Default personal workspace tenant metadata and feature whitelist (§10.2 PRD). */
public final class PersonalTenantDefaults {

  public static final String DISPLAY_NAME = "个人空间";

  /** Map basics are always available; premium features are omitted for personal tenants. */
  public static final List<String> FEATURE_CODES = List.of();

  private PersonalTenantDefaults() {}
}
