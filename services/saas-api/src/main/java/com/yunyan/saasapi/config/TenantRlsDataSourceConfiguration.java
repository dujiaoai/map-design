package com.yunyan.saasapi.config;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "saas.tenant-rls", name = "enabled", havingValue = "true")
@EnableConfigurationProperties(TenantRlsProperties.class)
public class TenantRlsDataSourceConfiguration {

  private static final String RESET_RLS_SESSION =
      "RESET app.tenant_id; RESET app.bypass_tenant_rls;";

  @Bean
  BeanPostProcessor tenantRlsDataSourceWrapper() {
    return new BeanPostProcessor() {
      @Override
      public Object postProcessAfterInitialization(Object bean, String beanName)
          throws BeansException {
        if (!"dataSource".equals(beanName) || !(bean instanceof DataSource dataSource)) {
          return bean;
        }
        if (dataSource instanceof TenantRlsDataSource) {
          return bean;
        }
        if (dataSource instanceof HikariDataSource hikari) {
          hikari.setConnectionInitSql(RESET_RLS_SESSION);
        }
        return new TenantRlsDataSource(dataSource);
      }
    };
  }
}
