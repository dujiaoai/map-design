package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysEmailVerificationToken;
import com.yunyan.saasapi.domain.mapper.SysEmailVerificationTokenMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class EmailVerificationTokenRepository {

  public static final String PURPOSE_INVITE = "invite";

  private final SysEmailVerificationTokenMapper sysEmailVerificationTokenMapper;

  public void insert(SysEmailVerificationToken token) {
    TenantRlsBypass.run(() -> sysEmailVerificationTokenMapper.insert(token));
  }

  public void invalidateActiveInviteTokens(UUID userId) {
    TenantRlsBypass.run(
        () ->
            sysEmailVerificationTokenMapper.update(
                null,
                Wrappers.<SysEmailVerificationToken>lambdaUpdate()
                    .eq(SysEmailVerificationToken::getUserId, userId)
                    .eq(SysEmailVerificationToken::getPurpose, PURPOSE_INVITE)
                    .isNull(SysEmailVerificationToken::getConsumedAt)
                    .gt(SysEmailVerificationToken::getExpiresAt, Instant.now())
                    .set(SysEmailVerificationToken::getConsumedAt, Instant.now())));
  }

  public Optional<SysEmailVerificationToken> findActiveInviteByHash(String tokenHash) {
    return TenantRlsBypass.call(
        () ->
            Optional.ofNullable(
                sysEmailVerificationTokenMapper.selectOne(
                    Wrappers.<SysEmailVerificationToken>lambdaQuery()
                        .eq(SysEmailVerificationToken::getTokenHash, tokenHash)
                        .eq(SysEmailVerificationToken::getPurpose, PURPOSE_INVITE)
                        .isNull(SysEmailVerificationToken::getConsumedAt)
                        .gt(SysEmailVerificationToken::getExpiresAt, Instant.now()))));
  }

  public void consume(UUID tokenId) {
    TenantRlsBypass.run(
        () -> {
          var row = new SysEmailVerificationToken();
          row.setId(tokenId);
          row.setConsumedAt(Instant.now());
          sysEmailVerificationTokenMapper.updateById(row);
        });
  }
}
