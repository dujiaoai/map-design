package com.yunyan.saasapi.config;

import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import com.yunyan.saasapi.security.TenantContext;
import java.util.Set;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.StringValue;
import org.springframework.stereotype.Component;

@Component
public class SaasTenantLineHandler implements TenantLineHandler {

  private static final Set<String> TENANT_TABLES = Set.of("sys_user", "map_layer", "uav_dock");

  @Override
  public Expression getTenantId() {
    return new StringValue(TenantContext.require());
  }

  @Override
  public String getTenantIdColumn() {
    return "tenant_id";
  }

  @Override
  public boolean ignoreTable(String tableName) {
    if (!TENANT_TABLES.contains(tableName.toLowerCase())) {
      return true;
    }
    var tenantId = TenantContext.get();
    return tenantId == null || tenantId.isBlank();
  }
}
