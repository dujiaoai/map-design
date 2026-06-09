package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.mapper.SysTenantMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantRepository {

  private final SysUserMapper sysUserMapper;
  private final SysTenantMapper sysTenantMapper;

  public Optional<String> findActiveUserEmail(UUID userId) {
    var user = sysUserMapper.selectById(userId);
    if (user == null || !"active".equals(user.getStatus())) {
      return Optional.empty();
    }
    return Optional.of(user.getEmail());
  }

  public List<SysTenant> findAllTenants() {
    return sysTenantMapper.selectList(
        Wrappers.<SysTenant>lambdaQuery().orderByAsc(SysTenant::getName));
  }

  public List<SysTenant> findTenantsByUserEmail(String email) {
    var users = sysUserMapper.selectActiveByEmailAcrossTenants(email);
    if (users.isEmpty()) {
      return List.of();
    }
    var tenantIds = users.stream().map(SysUser::getTenantId).distinct().toList();
    return sysTenantMapper.selectList(
        Wrappers.<SysTenant>lambdaQuery()
            .in(SysTenant::getId, tenantIds)
            .orderByAsc(SysTenant::getName));
  }
}
