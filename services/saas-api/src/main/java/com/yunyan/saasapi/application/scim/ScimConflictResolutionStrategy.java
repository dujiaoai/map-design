package com.yunyan.saasapi.application.scim;

public enum ScimConflictResolutionStrategy {
  LAST_WRITE_WINS,
  IDP_WINS;

  public static ScimConflictResolutionStrategy fromDb(String value) {
    if (value == null) {
      return LAST_WRITE_WINS;
    }
    return "idp_wins".equalsIgnoreCase(value.trim()) ? IDP_WINS : LAST_WRITE_WINS;
  }

  public String toDbValue() {
    return this == IDP_WINS ? "idp_wins" : "last_write_wins";
  }
}
