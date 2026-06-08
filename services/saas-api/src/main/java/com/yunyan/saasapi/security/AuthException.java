package com.yunyan.saasapi.security;

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

  public static AuthException badRequest(String message) {
    return new AuthException(HttpStatus.BAD_REQUEST, message);
  }
}
