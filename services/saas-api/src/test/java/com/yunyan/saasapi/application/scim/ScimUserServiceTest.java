package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.ScimUserExternalIdRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.ScimUserExternalId;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.web.dto.scim.ScimCreateUserRequest;
import com.yunyan.saasapi.web.dto.scim.ScimPatchUserRequest;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class ScimUserServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Mock TenantRepository tenantRepository;
  @Mock UserRepository userRepository;
  @Mock RoleRepository roleRepository;
  @Mock ScimUserExternalIdRepository externalIdRepository;
  @Mock PasswordEncoder passwordEncoder;
  @Mock UserSessionRevoker userSessionRevoker;

  @InjectMocks ScimUserService service;

  @Test
  void createUser_insertsMapping() {
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(new SysTenant()));
    when(externalIdRepository.findByTenantAndExternalId(eq(TENANT_ID), any())).thenReturn(Optional.empty());
    when(userRepository.findByTenantIdAndEmail(eq(TENANT_ID), any())).thenReturn(Optional.empty());
    when(passwordEncoder.encode(any())).thenReturn("hash");
    var role = new SysRole();
    role.setId(UUID.randomUUID());
    when(roleRepository.findByCode("MEMBER")).thenReturn(Optional.of(role));

    var result =
        service.createUser(
            TENANT_ID, new ScimCreateUserRequest("ext-1", "scim-user@test.local", "SCIM User", true));

    assertThat(result.userName()).isEqualTo("scim-user@test.local");
    verify(userRepository).insert(any(SysUser.class));
    verify(externalIdRepository).insert(any(ScimUserExternalId.class));
  }

  @Test
  void deleteUser_deactivatesMember() {
    var mapping = new ScimUserExternalId();
    mapping.setTenantId(TENANT_ID);
    mapping.setExternalId("ext-1");
    mapping.setUserId(UUID.randomUUID());
    mapping.setActive(true);
    var user = new SysUser();
    user.setId(mapping.getUserId());
    user.setTenantId(TENANT_ID);
    user.setEmail("scim-user@test.local");
    user.setDisplayName("SCIM User");
    user.setStatus("active");
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(new SysTenant()));
    when(externalIdRepository.findByTenantAndExternalId(TENANT_ID, "ext-1"))
        .thenReturn(Optional.of(mapping));
    when(userRepository.findById(mapping.getUserId())).thenReturn(Optional.of(user));

    service.deleteUser(TENANT_ID, "ext-1");

    assertThat(user.getStatus()).isEqualTo("disabled");
    verify(userSessionRevoker).handleUserStatusChange(eq("active"), eq("disabled"), eq(user));
  }
}
