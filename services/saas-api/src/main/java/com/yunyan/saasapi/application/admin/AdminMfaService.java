package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminMfaStatusResponse;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminMfaService {

  private final SaasAppProperties saasAppProperties;

  /** 骨架期：无 TOTP 持久化，enrolled 恒为 false。Phase 2 读取 user_mfa_totp。 */
  public AdminMfaStatusResponse getStatus(SaasPrincipal principal) {
    Objects.requireNonNull(principal, "principal");
    var adminMfa = saasAppProperties.getAuth().getAdminMfa();
    return new AdminMfaStatusResponse(
        adminMfa.isEnforcementEnabled(),
        false,
        false,
        null);
  }

  /** 骨架期：无已注册平台管理员。 */
  public int countEnrolledPlatformAdmins() {
    return 0;
  }
}
