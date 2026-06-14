package com.yunyan.billingapi.security;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {

  private final HttpStatus status;

  public AuthException(HttpStatus status, String message) {
    super(message);
    this.status = status;
  }

  public HttpStatus getStatus() {
    return status;
  }

  public static AuthException unauthorized(String message) {
    return new AuthException(HttpStatus.UNAUTHORIZED, message);
  }
}
