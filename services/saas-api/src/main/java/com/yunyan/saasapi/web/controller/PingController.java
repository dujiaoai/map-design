package com.yunyan.saasapi.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
@Tag(name = "System")
public class PingController {

  @GetMapping("/ping")
  @Operation(summary = "服务存活探测")
  public Map<String, String> ping() {
    return Map.of(
        "status", "ok",
        "service", "saas-api");
  }
}
