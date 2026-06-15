package com.yunyan.billingapi.config;

import com.yunyan.billingapi.security.TenantContext;
import com.yunyan.billingapi.security.TenantRlsBypass;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.sql.DataSource;
import org.springframework.jdbc.datasource.DelegatingDataSource;

/** Applies PostgreSQL session variables for RLS before each borrowed connection is used. */
public class TenantRlsDataSource extends DelegatingDataSource {

  private static final Pattern UUID_PATTERN =
      Pattern.compile(
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

  public TenantRlsDataSource(DataSource target) {
    super(target);
  }

  @Override
  public Connection getConnection() throws SQLException {
    var connection = super.getConnection();
    applySessionVariables(connection);
    return connection;
  }

  @Override
  public Connection getConnection(String username, String password) throws SQLException {
    var connection = super.getConnection(username, password);
    applySessionVariables(connection);
    return connection;
  }

  private void applySessionVariables(Connection connection) throws SQLException {
    try (Statement statement = connection.createStatement()) {
      if (TenantRlsBypass.isActive()) {
        statement.execute("RESET app.tenant_id");
        statement.execute("SET app.bypass_tenant_rls = 'on'");
        return;
      }
      var tenantId = TenantContext.get();
      if (tenantId != null && !tenantId.isBlank()) {
        statement.execute("RESET app.bypass_tenant_rls");
        statement.execute("SET app.tenant_id = '" + requireUuid(tenantId) + "'");
        return;
      }
      statement.execute("RESET app.tenant_id");
      statement.execute("RESET app.bypass_tenant_rls");
    }
  }

  private static String requireUuid(String tenantId) {
    if (!UUID_PATTERN.matcher(tenantId).matches()) {
      throw new IllegalStateException("Invalid tenant_id for RLS session variable");
    }
    UUID.fromString(tenantId);
    return tenantId;
  }
}
