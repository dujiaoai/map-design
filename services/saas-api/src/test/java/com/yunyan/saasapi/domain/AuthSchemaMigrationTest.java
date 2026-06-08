package com.yunyan.saasapi.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AuthSchemaMigrationTest {

  @Autowired
  SysRoleMapper sysRoleMapper;

  @Test
  void flyway_appliesAuthTablesAndSeedsRoles() {
    List<SysRole> roles = sysRoleMapper.selectList(null);
    assertThat(roles).hasSize(4);
    assertThat(roles).extracting(SysRole::getCode)
        .containsExactlyInAnyOrder(
            "PLATFORM_ADMIN", "TENANT_ADMIN", "MEMBER", "VIEWER");
  }
}
