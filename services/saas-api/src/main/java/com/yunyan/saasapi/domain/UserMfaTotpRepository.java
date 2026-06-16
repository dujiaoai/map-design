package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.SysUserMfaTotp;
import com.yunyan.saasapi.domain.mapper.SysUserMfaTotpMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserMfaTotpRepository {

  private final SysUserMfaTotpMapper sysUserMfaTotpMapper;

  public Optional<SysUserMfaTotp> findByUserId(UUID userId) {
    return TenantRlsBypass.call(() -> Optional.ofNullable(sysUserMfaTotpMapper.selectById(userId)));
  }

  public void upsert(SysUserMfaTotp row) {
    TenantRlsBypass.run(
        () -> {
          var existing = sysUserMfaTotpMapper.selectById(row.getUserId());
          if (existing == null) {
            sysUserMfaTotpMapper.insert(row);
          } else {
            sysUserMfaTotpMapper.updateById(row);
          }
        });
  }

  public void deleteByUserId(UUID userId) {
    TenantRlsBypass.run(() -> sysUserMfaTotpMapper.deleteById(userId));
  }

  public int countEnrolled() {
    return TenantRlsBypass.call(
        () ->
            Math.toIntExact(
                sysUserMfaTotpMapper.selectCount(null)));
  }
}
