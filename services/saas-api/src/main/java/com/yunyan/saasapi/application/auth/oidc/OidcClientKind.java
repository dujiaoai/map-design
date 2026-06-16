package com.yunyan.saasapi.application.auth.oidc;

public enum OidcClientKind {
  WEB,
  ADMIN;

  public static OidcClientKind from(String raw) {
    if (raw == null || raw.isBlank()) {
      return WEB;
    }
    return switch (raw.trim().toLowerCase()) {
      case "admin" -> ADMIN;
      case "web" -> WEB;
      default -> throw new IllegalArgumentException("Unsupported OIDC client: " + raw);
    };
  }
}
