package com.yunyan.saasapi.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
  JwtProperties.class,
  SaasAppProperties.class,
  BillingApiProperties.class,
  TenantRlsProperties.class
})
public class AppConfig {}
