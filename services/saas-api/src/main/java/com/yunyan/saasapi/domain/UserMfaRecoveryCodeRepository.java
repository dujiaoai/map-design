package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.SysUserMfaRecoveryCode;
import com.yunyan.saasapi.domain.mapper.SysUserMfaRecoveryCodeMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UserMfaRecoveryCodeRepository {

  private final SysUserMfaRecoveryCodeMapper sysUserMfaRecoveryCodeMapper;

  public void replaceAll(UUID userId, List<SysUserMfaRecoveryCode> rows) {
    TenantRlsBypass.run(
        () -> {
          deleteByUserId(userId);
          for (var row : rows) {
            sysUserMfaRecoveryCodeMapper.insert(row);
          }
        });
  }

  public void deleteByUserId(UUID userId) {
    TenantRlsBypass.run(
        () ->
            sysUserMfaRecoveryCodeMapper.delete(
                new LambdaQueryWrapper<SysUserMfaRecoveryCode>()
                    .eq(SysUserMfaRecoveryCode::getUserId, userId)));
  }

  public List<SysUserMfaRecoveryCode> findUnusedByUserId(UUID userId) {
    return TenantRlsBypass.call(
        () ->
            sysUserMfaRecoveryCodeMapper.selectList(
                new LambdaQueryWrapper<SysUserMfaRecoveryCode>()
                    .eq(SysUserMfaRecoveryCode::getUserId, userId)
                    .isNull(SysUserMfaRecoveryCode::getUsedAt)));
  }

  public int countUnusedByUserId(UUID userId) {
    return TenantRlsBypass.call(
        () ->
            Math.toIntExact(
                sysUserMfaRecoveryCodeMapper.selectCount(
                    new LambdaQueryWrapper<SysUserMfaRecoveryCode>()
                        .eq(SysUserMfaRecoveryCode::getUserId, userId)
                        .isNull(SysUserMfaRecoveryCode::getUsedAt))));
  }

  public void markUsed(UUID id, Instant usedAt) {
    TenantRlsBypass.run(
        () -> {
          var row = sysUserMfaRecoveryCodeMapper.selectById(id);
          if (row == null) {
            return;
          }
          row.setUsedAt(usedAt);
          sysUserMfaRecoveryCodeMapper.updateById(row);
        });
  }
}
