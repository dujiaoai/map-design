package com.yunyan.saasapi.web.advice;

import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.ratelimit.RateLimitException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AuthException.class)
  ResponseEntity<ProblemDetail> handleAuth(AuthException ex) {
    var problem = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
    problem.setTitle(titleForAuthStatus(ex.getStatus()));
    problem.setType(java.net.URI.create("https://api.yunyan.com/errors/auth"));
    return ResponseEntity.status(ex.getStatus()).body(problem);
  }

  @ExceptionHandler(RateLimitException.class)
  ResponseEntity<ProblemDetail> handleRateLimit(RateLimitException ex) {
    var problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
    problem.setTitle("Too many requests");
    problem.setType(java.net.URI.create("https://api.yunyan.com/errors/rate-limit"));
    var retryAfter = Math.max(1, ex.getRetryAfter().getSeconds());
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter))
        .body(problem);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
    var problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
    problem.setTitle("Validation failed");
    problem.setType(java.net.URI.create("https://api.yunyan.com/errors/validation"));
    List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
        .map(this::toFieldError)
        .toList();
    problem.setProperty("errors", errors);
    return ResponseEntity.badRequest().body(problem);
  }

  private static String titleForAuthStatus(HttpStatus status) {
    return switch (status) {
      case UNAUTHORIZED -> "Unauthorized";
      case NOT_FOUND -> "Not Found";
      case CONFLICT -> "Conflict";
      case FORBIDDEN -> "Forbidden";
      case TOO_MANY_REQUESTS -> "Too many requests";
      default -> "Bad request";
    };
  }

  private Map<String, String> toFieldError(FieldError error) {
    return Map.of(
        "field", error.getField(),
        "message", error.getDefaultMessage() == null ? "invalid" : error.getDefaultMessage());
  }
}
