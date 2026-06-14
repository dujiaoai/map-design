package com.yunyan.billingapi.web.advice;

import com.yunyan.billingapi.security.AuthException;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class BillingApiExceptionHandler {

  @ExceptionHandler(AuthException.class)
  ResponseEntity<Map<String, String>> handleAuthException(AuthException exception) {
    return ResponseEntity.status(exception.getStatus())
        .body(Map.of("message", exception.getMessage()));
  }
}
