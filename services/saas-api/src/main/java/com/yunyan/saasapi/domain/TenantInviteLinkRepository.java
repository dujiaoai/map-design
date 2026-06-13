package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysTenantInviteLink;
import com.yunyan.saasapi.domain.mapper.SysTenantInviteLinkMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantInviteLinkRepository {

  private final SysTenantInviteLinkMapper sysTenantInviteLinkMapper;

  public void insert(SysTenantInviteLink link) {
    TenantRlsBypass.run(() -> sysTenantInviteLinkMapper.insert(link));
  }

  public Optional<SysTenantInviteLink> findByTokenHash(String tokenHash) {
    return TenantRlsBypass.call(
        () ->
            Optional.ofNullable(
                sysTenantInviteLinkMapper.selectOne(
                    Wrappers.<SysTenantInviteLink>lambdaQuery()
                        .eq(SysTenantInviteLink::getTokenHash, tokenHash))));
  }

  public Optional<SysTenantInviteLink> findById(UUID id) {
    return TenantRlsBypass.call(
        () -> Optional.ofNullable(sysTenantInviteLinkMapper.selectById(id)));
  }

  public List<SysTenantInviteLink> findByTenantId(UUID tenantId) {
    return TenantRlsBypass.call(
        () ->
            sysTenantInviteLinkMapper.selectList(
                Wrappers.<SysTenantInviteLink>lambdaQuery()
                    .eq(SysTenantInviteLink::getTenantId, tenantId)
                    .orderByDesc(SysTenantInviteLink::getCreatedAt)));
  }

  public void revoke(UUID id, Instant revokedAt) {
    TenantRlsBypass.run(
        () -> {
          var row = new SysTenantInviteLink();
          row.setId(id);
          row.setRevokedAt(revokedAt);
          sysTenantInviteLinkMapper.updateById(row);
        });
  }

  /** 原子递增使用次数；返回是否成功（链接仍有效且未达上限）。 */
  public boolean tryIncrementUseCount(UUID id) {
    return TenantRlsBypass.call(
        () -> {
          var now = Instant.now();
          var updated =
              sysTenantInviteLinkMapper.update(
                  null,
                  Wrappers.<SysTenantInviteLink>lambdaUpdate()
                      .eq(SysTenantInviteLink::getId, id)
                      .isNull(SysTenantInviteLink::getRevokedAt)
                      .and(
                          wrapper ->
                              wrapper
                                  .isNull(SysTenantInviteLink::getExpiresAt)
                                  .or()
                                  .gt(SysTenantInviteLink::getExpiresAt, now))
                      .and(
                          wrapper ->
                              wrapper
                                  .isNull(SysTenantInviteLink::getMaxUses)
                                  .or()
                                  .apply("use_count < max_uses"))
                      .setSql("use_count = use_count + 1"));
          return updated > 0;
        });
  }
}
