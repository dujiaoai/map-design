package com.yunyan.saasapi.application.internal;

import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.web.dto.internal.MembershipCheckResponse;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InternalMembershipService {

  private static final Set<String> BILLING_ELIGIBLE_STATUSES =
      Set.of("active", "disabled", "pending");

  private final UserRepository userRepository;

  public MembershipCheckResponse checkMembership(UUID tenantId, UUID userId) {
    return userRepository
        .findById(userId)
        .filter(user -> tenantId.equals(user.getTenantId()))
        .filter(user -> BILLING_ELIGIBLE_STATUSES.contains(user.getStatus()))
        .map(user -> new MembershipCheckResponse(true, user.getStatus()))
        .orElseGet(() -> new MembershipCheckResponse(false, null));
  }
}
