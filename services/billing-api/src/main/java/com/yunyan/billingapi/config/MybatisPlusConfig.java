package com.yunyan.billingapi.config;

import com.baomidou.mybatisplus.autoconfigure.ConfigurationCustomizer;
import java.util.UUID;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.yunyan.billingapi.domain.mapper")
public class MybatisPlusConfig {

  @Bean
  ConfigurationCustomizer uuidTypeHandlerCustomizer() {
    return configuration ->
        configuration.getTypeHandlerRegistry().register(UUID.class, UuidTypeHandler.class);
  }
}
