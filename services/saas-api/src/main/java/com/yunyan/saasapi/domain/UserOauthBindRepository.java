package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysUserOauthBind;
import com.yunyan.saasapi.domain.mapper.SysUserOauthBindMapper;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
@RequiredArgsConstructor
public class UserOauthBindRepository {

  private final SysUserOauthBindMapper sysUserOauthBindMapper;

  public Optional<UUID> findUserIdByProviderSubject(String providerId, String providerSubject) {
    return TenantRlsBypass.call(
        () -> {
          var row =
              sysUserOauthBindMapper.selectOne(
                  Wrappers.<SysUserOauthBind>lambdaQuery()
                      .eq(SysUserOauthBind::getProviderId, providerId)
                      .eq(SysUserOauthBind::getProviderSubject, providerSubject));
          return row == null ? Optional.empty() : Optional.of(row.getUserId());
        });
  }

  public void bindUser(
      UUID userId, String providerId, String providerSubject, String emailSnapshot) {
    TenantRlsBypass.run(
        () -> {
          var existing =
              sysUserOauthBindMapper.selectOne(
                  Wrappers.<SysUserOauthBind>lambdaQuery()
                      .eq(SysUserOauthBind::getProviderId, providerId)
                      .eq(SysUserOauthBind::getProviderSubject, providerSubject));
          var now = Instant.now();
          if (existing != null) {
            if (!existing.getUserId().equals(userId)) {
              throw AuthException.conflict("OIDC subject already linked to another account");
            }
            existing.setLastUsedAt(now);
            if (StringUtils.hasText(emailSnapshot)) {
              existing.setEmailSnapshot(emailSnapshot.trim());
            }
            sysUserOauthBindMapper.updateById(existing);
            return;
          }
          var row = new SysUserOauthBind();
          row.setId(UUID.randomUUID());
          row.setUserId(userId);
          row.setProviderId(providerId);
          row.setProviderSubject(providerSubject);
          row.setEmailSnapshot(StringUtils.hasText(emailSnapshot) ? emailSnapshot.trim() : null);
          row.setCreatedAt(now);
          row.setLastUsedAt(now);
          sysUserOauthBindMapper.insert(row);
        });
  }

  public void touchLastUsed(String providerId, String providerSubject) {
    TenantRlsBypass.run(
        () -> {
          var existing =
              sysUserOauthBindMapper.selectOne(
                  Wrappers.<SysUserOauthBind>lambdaQuery()
                      .eq(SysUserOauthBind::getProviderId, providerId)
                      .eq(SysUserOauthBind::getProviderSubject, providerSubject));
          if (existing == null) {
            return;
          }
          existing.setLastUsedAt(Instant.now());
          sysUserOauthBindMapper.updateById(existing);
        });
  }
}
