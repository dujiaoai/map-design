package com.yunyan.saasapi.application.admin;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.UserRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSessionRevocationServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private UserSessionRevoker userSessionRevoker;

  @InjectMocks private TenantSessionRevocationService service;

  @Test
  void revokeAllMemberSessions_revokesEachUser() {
    var tenantId = UUID.randomUUID();
    var userA = UUID.randomUUID();
    var userB = UUID.randomUUID();
    when(userRepository.findUserIdsByTenantId(tenantId)).thenReturn(List.of(userA, userB));

    var count = service.revokeAllMemberSessions(tenantId);

    org.junit.jupiter.api.Assertions.assertEquals(2, count);
    verify(userSessionRevoker).revokeActiveSessions(userA);
    verify(userSessionRevoker).revokeActiveSessions(userB);
  }
}
