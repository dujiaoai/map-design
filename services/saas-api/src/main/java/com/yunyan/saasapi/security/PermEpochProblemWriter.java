package com.yunyan.saasapi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

final class PermEpochProblemWriter {

  private PermEpochProblemWriter() {}

  static void write(HttpServletResponse response, ObjectMapper objectMapper) throws IOException {
    var problem =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.FORBIDDEN, "JWT perm_epoch is stale; refresh tokens or sign in again");
    problem.setTitle("Permissions expired");
    problem.setType(java.net.URI.create(PermEpochStaleException.PROBLEM_TYPE));
    response.setStatus(HttpStatus.FORBIDDEN.value());
    response.setContentType("application/problem+json");
    objectMapper.writeValue(response.getOutputStream(), problem);
  }
}
