package com.yunyan.saasapi.web.advice;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

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

  private Map<String, String> toFieldError(FieldError error) {
    return Map.of(
        "field", error.getField(),
        "message", error.getDefaultMessage() == null ? "invalid" : error.getDefaultMessage());
  }
}
