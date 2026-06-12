package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.mapper.SysTenantFeatureMapper;
import com.yunyan.saasapi.domain.mapper.SysTenantMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
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
  private final SysTenantFeatureMapper sysTenantFeatureMapper;

  public Optional<String> findActiveUserEmail(UUID userId) {
    var user = sysUserMapper.selectById(userId);
    if (user == null || !"active".equals(user.getStatus())) {
      return Optional.empty();
    }
    return Optional.of(user.getEmail());
  }

  public Optional<SysTenant> findById(UUID tenantId) {
    return Optional.ofNullable(sysTenantMapper.selectById(tenantId));
  }

  public List<String> findFeatureCodes(UUID tenantId) {
    return sysTenantFeatureMapper.selectFeatureCodesByTenantId(tenantId);
  }

  public List<SysTenant> findAllTenants() {
    return sysTenantMapper.selectList(
        Wrappers.<SysTenant>lambdaQuery().orderByAsc(SysTenant::getName));
  }

  public long countTenants() {
    return sysTenantMapper.selectCount(null);
  }

  public long countActiveTenants() {
    return sysTenantMapper.selectCount(
        Wrappers.<SysTenant>lambdaQuery()
            .and(
                wrapper ->
                    wrapper
                        .eq(SysTenant::getStatus, "active")
                        .or()
                        .isNull(SysTenant::getStatus)));
  }

  public List<SysTenant> findByIds(List<UUID> tenantIds) {
    if (tenantIds.isEmpty()) {
      return List.of();
    }
    return sysTenantMapper.selectList(
        Wrappers.<SysTenant>lambdaQuery().in(SysTenant::getId, tenantIds));
  }

  public Optional<SysTenant> findBySlug(String slug) {
    return Optional.ofNullable(
        sysTenantMapper.selectOne(Wrappers.<SysTenant>lambdaQuery().eq(SysTenant::getSlug, slug)));
  }

  public void insert(SysTenant tenant) {
    sysTenantMapper.insert(tenant);
  }

  public void update(SysTenant tenant) {
    sysTenantMapper.updateById(tenant);
  }

  public List<SysTenant> findTenantsByUserEmail(String email) {
    return TenantRlsBypass.call(() -> findTenantsByUserEmailWithRlsBypass(email));
  }

  private List<SysTenant> findTenantsByUserEmailWithRlsBypass(String email) {
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
