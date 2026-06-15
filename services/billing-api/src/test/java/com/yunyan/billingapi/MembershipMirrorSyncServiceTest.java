package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.billingapi.application.tenant.MembershipMirrorSyncService;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "billing.membership-sync.enabled=true",
      "billing.membership-sync.saas.url=jdbc:h2:mem:billing_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
      "billing.membership-sync.saas.username=sa",
      "billing.membership-sync.saas.password="
    })
class MembershipMirrorSyncServiceTest {

  @Autowired MembershipMirrorSyncService membershipMirrorSyncService;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMirrorTables() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
    jdbcTemplate.execute(
        """
        CREATE TABLE IF NOT EXISTS sys_tenant_feature (
            tenant_id UUID NOT NULL,
            feature_code VARCHAR(128) NOT NULL,
            PRIMARY KEY (tenant_id, feature_code)
        )
        """);
    jdbcTemplate.update("DELETE FROM sys_user");
    jdbcTemplate.update("DELETE FROM sys_tenant_feature");

    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    jdbcTemplate.update(
        """
        INSERT INTO sys_user (id, tenant_id, email, status)
        VALUES (?, ?, ?, ?)
        """,
        userId,
        tenantId,
        "mirror-sync@billing-test.local",
        "active");
    jdbcTemplate.update(
        """
        INSERT INTO sys_tenant_feature (tenant_id, feature_code)
        VALUES (?, ?)
        """,
        tenantId,
        "members_can_recharge");
  }

  @Test
  void syncFromSaas_copiesUsersAndTenantFeatures() {
    var result = membershipMirrorSyncService.syncFromSaas();

    assertThat(result.userCount()).isEqualTo(1);
    assertThat(result.featureCount()).isEqualTo(1);

    var userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM sys_user", Integer.class);
    var featureCount =
        jdbcTemplate.queryForObject("SELECT COUNT(*) FROM sys_tenant_feature", Integer.class);
    assertThat(userCount).isEqualTo(1);
    assertThat(featureCount).isEqualTo(1);
  }
}
