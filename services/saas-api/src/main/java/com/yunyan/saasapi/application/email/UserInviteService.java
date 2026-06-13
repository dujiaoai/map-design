package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.application.auth.EmailNormalizer;
import com.yunyan.saasapi.domain.EmailVerificationTokenRepository;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysEmailVerificationToken;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserInviteService {

  public static final String STATUS_INVITED = "invited";
  private static final String DEFAULT_ROLE = "MEMBER";

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailTokenHasher emailTokenHasher;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final EmailDeliveryService emailDeliveryService;
  private final SaasAppProperties saasAppProperties;

  @Transactional
  public void createInvitedUserAndSendEmail(
      SysTenant tenant, String email, String displayName, String roleCode) {
    var normalizedEmail = EmailNormalizer.normalize(email);
    if (userRepository.findByTenantIdAndEmail(tenant.getId(), normalizedEmail).isPresent()) {
      throw AuthException.conflict("Email already registered for this tenant");
    }

    var role =
        roleRepository
            .findByCode(resolveRoleCode(roleCode))
            .orElseThrow(() -> new IllegalStateException("Role is not seeded: " + roleCode));

    var user = new SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenant.getId());
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
    user.setDisplayName(resolveDisplayName(normalizedEmail, displayName));
    user.setStatus(STATUS_INVITED);
    user.setCreatedAt(Instant.now());
    userRepository.insert(user);
    userRepository.insertUserRole(user.getId(), role.getId());

    sendInviteEmail(tenant, user);
  }

  @Transactional
  public void resendInviteEmail(SysTenant tenant, SysUser user) {
    if (!STATUS_INVITED.equals(user.getStatus())) {
      throw AuthException.badRequest("User is not awaiting invite acceptance");
    }
    emailVerificationTokenRepository.invalidateActiveInviteTokens(user.getId());
    sendInviteEmail(tenant, user);
  }

  private void sendInviteEmail(SysTenant tenant, SysUser user) {
    var rawToken = emailTokenHasher.generateRawToken();
    var token = new SysEmailVerificationToken();
    token.setId(UUID.randomUUID());
    token.setUserId(user.getId());
    token.setPurpose(EmailVerificationTokenRepository.PURPOSE_INVITE);
    token.setTokenHash(emailTokenHasher.hash(rawToken));
    token.setExpiresAt(Instant.now().plus(saasAppProperties.getInvite().getTokenTtl()));
    token.setCreatedAt(Instant.now());
    emailVerificationTokenRepository.insert(token);

    var inviteUrl =
        saasAppProperties.getApp().getWebBaseUrl().replaceAll("/$", "")
            + "/accept-invite?token="
            + rawToken;
    emailDeliveryService.queueInviteEmail(
        tenant.getId(), user.getId(), user.getEmail(), tenant.getName(), inviteUrl);
  }

  private static String resolveRoleCode(String roleCode) {
    if (!StringUtils.hasText(roleCode)) {
      return DEFAULT_ROLE;
    }
    return roleCode.trim();
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }
}
