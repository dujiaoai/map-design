package com.yunyan.billingapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

public final class SecurityProblemWriter {

  private SecurityProblemWriter() {}

  public static void writeUnauthorized(HttpServletResponse response, ObjectMapper objectMapper)
      throws IOException {
    write(
        response,
        objectMapper,
        HttpStatus.UNAUTHORIZED,
        "Authentication required",
        "Unauthorized");
  }

  public static void writeForbidden(HttpServletResponse response, ObjectMapper objectMapper)
      throws IOException {
    write(response, objectMapper, HttpStatus.FORBIDDEN, "Access denied", "Forbidden");
  }

  public static void write(
      HttpServletResponse response,
      ObjectMapper objectMapper,
      HttpStatus status,
      String detail,
      String title)
      throws IOException {
    var problem = ProblemDetail.forStatusAndDetail(status, detail);
    problem.setTitle(title);
    response.setStatus(status.value());
    response.setContentType("application/problem+json");
    objectMapper.writeValue(response.getOutputStream(), problem);
  }
}
