package com.yunyan.billingapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BillingApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(BillingApiApplication.class, args);
  }
}
