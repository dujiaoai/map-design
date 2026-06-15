package com.yunyan.billingapi.web.advice;

import com.yunyan.billingapi.application.hold.InsufficientBalanceException;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.ratelimit.RateLimitException;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class BillingApiExceptionHandler {

  private static final URI VALIDATION_ERROR_TYPE = URI.create("urn:yunyan:billing:validation_error");

  @ExceptionHandler(ConstraintViolationException.class)
  ResponseEntity<ProblemDetail> handleConstraintViolation(
      ConstraintViolationException exception) {
    var detail =
        exception.getConstraintViolations().stream()
            .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
            .findFirst()
            .orElse("Validation failed");
    return ResponseEntity.badRequest().body(validationProblem(detail));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException exception) {
    var detail =
        exception.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .findFirst()
            .orElse("Validation failed");
    return ResponseEntity.badRequest().body(validationProblem(detail));
  }

  private static ProblemDetail validationProblem(String detail) {
    var problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    problem.setTitle("Validation failed");
    problem.setType(VALIDATION_ERROR_TYPE);
    return problem;
  }

  @ExceptionHandler(RateLimitException.class)
  ResponseEntity<ProblemDetail> handleRateLimit(RateLimitException exception) {
    var problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, exception.getMessage());
    problem.setTitle("Too many requests");
    problem.setType(java.net.URI.create("urn:yunyan:billing:rate_limit"));
    var retryAfter = Math.max(1, exception.getRetryAfter().getSeconds());
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
        .body(problem);
  }

  @ExceptionHandler(AuthException.class)
  ResponseEntity<ProblemDetail> handleAuthException(AuthException exception) {
    var problem =
        ProblemDetail.forStatusAndDetail(exception.getStatus(), exception.getMessage());
    problem.setTitle(authProblemTitle(exception.getStatus()));
    problem.setType(java.net.URI.create("urn:yunyan:billing:api_error"));
    return ResponseEntity.status(exception.getStatus()).body(problem);
  }

  private static String authProblemTitle(HttpStatus status) {
    return switch (status) {
      case BAD_REQUEST -> "Bad request";
      case UNAUTHORIZED -> "Unauthorized";
      case FORBIDDEN -> "Forbidden";
      case NOT_FOUND -> "Not found";
      case CONFLICT -> "Conflict";
      default -> status.getReasonPhrase();
    };
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
