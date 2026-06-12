package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.application.admin.AdminListParams;
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
import org.springframework.util.StringUtils;

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

  public void replaceFeatureCodes(UUID tenantId, List<String> featureCodes) {
    sysTenantFeatureMapper.deleteByTenantId(tenantId);
    for (String featureCode : featureCodes) {
      sysTenantFeatureMapper.insert(tenantId, featureCode);
    }
  }

  public List<SysTenant> findAllTenants() {
    return findTenants(new AdminListParams(null, null, null)).items();
  }

  public AdminPagedResult<SysTenant> findTenants(AdminListParams params) {
    var wrapper =
        Wrappers.<SysTenant>lambdaQuery().orderByAsc(SysTenant::getName).orderByAsc(SysTenant::getId);
    var query = params.normalizedQuery();
    if (StringUtils.hasText(query)) {
      wrapper.and(
          w ->
              w.like(SysTenant::getName, query)
                  .or()
                  .like(SysTenant::getSlug, query)
                  .or()
                  .like(SysTenant::getPlan, query));
    }

    if (params.isPaginated()) {
      var page =
          sysTenantMapper.selectPage(
              new Page<>(params.resolvePage(), params.resolveSize()), wrapper);
      return new AdminPagedResult<>(page.getRecords(), page.getTotal());
    }

    var tenants = sysTenantMapper.selectList(wrapper);
    return new AdminPagedResult<>(tenants, tenants.size());
  }

  public List<UUID> findIdsBySearch(String q) {
    if (!StringUtils.hasText(q)) {
      return List.of();
    }
    var query = q.trim();
    return sysTenantMapper
        .selectList(
            Wrappers.<SysTenant>lambdaQuery()
                .like(SysTenant::getName, query)
                .or()
                .like(SysTenant::getSlug, query))
        .stream()
        .map(SysTenant::getId)
        .toList();
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
