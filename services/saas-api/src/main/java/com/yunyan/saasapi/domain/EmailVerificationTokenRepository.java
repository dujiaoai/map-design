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
  public static final String PURPOSE_PASSWORD_RESET = "password-reset";
  public static final String PURPOSE_REGISTER = "register";

  private final SysEmailVerificationTokenMapper sysEmailVerificationTokenMapper;

  public void insert(SysEmailVerificationToken token) {
    TenantRlsBypass.run(() -> sysEmailVerificationTokenMapper.insert(token));
  }

  public void invalidateActiveInviteTokens(UUID userId) {
    invalidateActiveTokens(userId, PURPOSE_INVITE);
  }

  public void invalidateActivePasswordResetTokens(UUID userId) {
    invalidateActiveTokens(userId, PURPOSE_PASSWORD_RESET);
  }

  public void invalidateActiveRegisterTokens(UUID userId) {
    invalidateActiveTokens(userId, PURPOSE_REGISTER);
  }

  private void invalidateActiveTokens(UUID userId, String purpose) {
    TenantRlsBypass.run(
        () ->
            sysEmailVerificationTokenMapper.update(
                null,
                Wrappers.<SysEmailVerificationToken>lambdaUpdate()
                    .eq(SysEmailVerificationToken::getUserId, userId)
                    .eq(SysEmailVerificationToken::getPurpose, purpose)
                    .isNull(SysEmailVerificationToken::getConsumedAt)
                    .gt(SysEmailVerificationToken::getExpiresAt, Instant.now())
                    .set(SysEmailVerificationToken::getConsumedAt, Instant.now())));
  }

  public Optional<SysEmailVerificationToken> findActiveInviteByHash(String tokenHash) {
    return findActiveByHash(tokenHash, PURPOSE_INVITE);
  }

  public Optional<SysEmailVerificationToken> findActivePasswordResetByHash(String tokenHash) {
    return findActiveByHash(tokenHash, PURPOSE_PASSWORD_RESET);
  }

  public Optional<SysEmailVerificationToken> findActiveRegisterByHash(String tokenHash) {
    return findActiveByHash(tokenHash, PURPOSE_REGISTER);
  }

  private Optional<SysEmailVerificationToken> findActiveByHash(String tokenHash, String purpose) {
    return TenantRlsBypass.call(
        () ->
            Optional.ofNullable(
                sysEmailVerificationTokenMapper.selectOne(
                    Wrappers.<SysEmailVerificationToken>lambdaQuery()
                        .eq(SysEmailVerificationToken::getTokenHash, tokenHash)
                        .eq(SysEmailVerificationToken::getPurpose, purpose)
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
