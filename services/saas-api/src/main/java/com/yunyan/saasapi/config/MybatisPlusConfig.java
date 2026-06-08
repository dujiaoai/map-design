package com.yunyan.saasapi.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.autoconfigure.ConfigurationCustomizer;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import java.util.UUID;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.yunyan.saasapi.domain.mapper")
public class MybatisPlusConfig {

  @Bean
  ConfigurationCustomizer uuidTypeHandlerCustomizer() {
    return configuration ->
        configuration.getTypeHandlerRegistry().register(UUID.class, UuidTypeHandler.class);
  }

  @Bean
  MybatisPlusInterceptor mybatisPlusInterceptor(SaasTenantLineHandler tenantLineHandler) {
    var interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(tenantLineHandler));
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.POSTGRE_SQL));
    return interceptor;
  }
}
