package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.BillingApiProperties;
import com.yunyan.saasapi.infrastructure.billing.BillingApiHealthIndicator;
import com.yunyan.saasapi.web.dto.admin.AdminSystemDependenciesResponse;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.actuate.health.Status;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminSystemDependenciesService {

  private static final String SAAS_API = "saas-api";
  private static final String BILLING_API = "billing-api";

  private final BillingApiProperties billingApiProperties;
  private final ObjectProvider<BillingApiHealthIndicator> billingApiHealthIndicator;

  public AdminSystemDependenciesResponse getDependencies() {
    var billingNode = buildBillingNode();
    return new AdminSystemDependenciesResponse(
        List.of(new AdminSystemDependenciesResponse.Edge(SAAS_API, BILLING_API, "HTTP /actuator/health")),
        List.of(
            new AdminSystemDependenciesResponse.Node(
                SAAS_API, "SaaS API", "UP", null, "Admin 路由可达即表示本进程在线"),
            billingNode));
  }

  private AdminSystemDependenciesResponse.Node buildBillingNode() {
    var baseUrl = billingApiProperties.getBaseUrl();
    if (!billingApiProperties.isEnabled()) {
      return new AdminSystemDependenciesResponse.Node(
          BILLING_API,
          "Billing API",
          "DISABLED",
          baseUrl,
          "saas.billing.enabled=false，钱包/充值不可用");
    }

    var indicator = billingApiHealthIndicator.getIfAvailable();
    if (indicator == null) {
      return new AdminSystemDependenciesResponse.Node(
          BILLING_API,
          "Billing API",
          "UNKNOWN",
          baseUrl,
          "探活组件未注册（检查 saas.billing.enabled）");
    }

    var health = indicator.health();
    var status = health.getStatus().equals(Status.UP) ? "UP" : "DOWN";
    var detail = resolveDetail(health.getDetails().get("url"), baseUrl, health.getDetails().get("error"));
    return new AdminSystemDependenciesResponse.Node(BILLING_API, "Billing API", status, baseUrl, detail);
  }

  private static String resolveDetail(Object urlDetail, String fallbackUrl, Object errorDetail) {
    if (errorDetail != null && !errorDetail.toString().isBlank()) {
      return errorDetail.toString();
    }
    var url = Objects.toString(urlDetail, fallbackUrl);
    return url + " · GET /actuator/health";
  }
}
