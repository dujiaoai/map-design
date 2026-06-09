package com.yunyan.saasapi.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "saas.cors")
public record CorsProperties(List<String> allowedOrigins) {

  public CorsProperties {
    if (allowedOrigins == null || allowedOrigins.isEmpty()) {
      allowedOrigins = List.of("http://localhost:5175");
    }
  }
}
