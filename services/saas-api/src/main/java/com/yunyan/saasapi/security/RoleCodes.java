package com.yunyan.saasapi.security;

public final class RoleCodes {

  private RoleCodes() {}

  public static String toSpringAuthority(String dbCode) {
    return "ROLE_" + dbCode;
  }
}
