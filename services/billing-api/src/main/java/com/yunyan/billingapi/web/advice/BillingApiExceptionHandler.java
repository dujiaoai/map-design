package com.yunyan.billingapi.web.advice;

import com.yunyan.billingapi.application.hold.InsufficientBalanceException;
import com.yunyan.billingapi.security.AuthException;
import java.util.Map;
import org.springframework.http.ProblemDetail;
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

  @ExceptionHandler(InsufficientBalanceException.class)
  ResponseEntity<ProblemDetail> handleInsufficientBalance(InsufficientBalanceException exception) {
    var problem =
        ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    problem.setTitle("Insufficient balance");
    problem.setType(java.net.URI.create("urn:yunyan:billing:insufficient_balance"));
    problem.setProperty("availableBalance", exception.getAvailableBalance());
    problem.setProperty("requiredPoints", exception.getRequiredPoints());
    return ResponseEntity.status(exception.getStatus()).body(problem);
  }
}
