package com.yunyan.saasapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SaasApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(SaasApiApplication.class, args);
  }
}
