package com.yunyan.billingapi.config;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.StringUtils;

@Configuration
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "enabled", havingValue = "true")
public class SaasMirrorDataSourceConfig {

  @Bean(name = "saasMirrorDataSource", destroyMethod = "close")
  DataSource saasMirrorDataSource(BillingAppProperties properties) {
    var saas = properties.getMembershipSync().getSaas();
    if (!StringUtils.hasText(saas.getUrl())) {
      throw new IllegalStateException(
          "billing.membership-sync.saas.url is required when membership-sync.enabled=true");
    }
    var dataSource = new HikariDataSource();
    dataSource.setJdbcUrl(saas.getUrl().trim());
    dataSource.setUsername(saas.getUsername());
    dataSource.setPassword(saas.getPassword());
    dataSource.setMaximumPoolSize(2);
    dataSource.setMinimumIdle(1);
    dataSource.setPoolName("saas-mirror");
    return dataSource;
  }

  @Bean(name = "saasMirrorJdbcTemplate")
  JdbcTemplate saasMirrorJdbcTemplate(DataSource saasMirrorDataSource) {
    return new JdbcTemplate(saasMirrorDataSource);
  }
}
