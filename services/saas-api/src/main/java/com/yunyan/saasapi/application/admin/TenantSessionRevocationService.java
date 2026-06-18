package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.UserSessionRevoker;
import com.yunyan.saasapi.domain.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantSessionRevocationService {

  private final UserRepository userRepository;
  private final UserSessionRevoker userSessionRevoker;

  /** 吊销租户下全部成员的 refresh / access 会话（幂等）。 */
  public int revokeAllMemberSessions(UUID tenantId) {
    var userIds = userRepository.findUserIdsByTenantId(tenantId);
    for (UUID userId : userIds) {
      userSessionRevoker.revokeActiveSessions(userId);
    }
    return userIds.size();
  }
}
