package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yunyan.saasapi.application.internal.MembershipSyncEventPublisher;
import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.application.auth.EmailNormalizer;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.tenant.TenantKind;
import com.yunyan.saasapi.domain.mapper.SysTenantFeatureMapper;
import com.yunyan.saasapi.domain.mapper.SysTenantMapper;
import com.yunyan.saasapi.domain.mapper.SysUserMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
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
  private final MembershipSyncEventPublisher membershipSyncEventPublisher;

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
    seedFeatureCodesWithoutPublish(tenantId, featureCodes);
    membershipSyncEventPublisher.publishTenantFeaturesReplace(tenantId, featureCodes);
  }

  public void seedFeatureCodes(UUID tenantId, List<String> featureCodes) {
    seedFeatureCodesWithoutPublish(tenantId, featureCodes);
    membershipSyncEventPublisher.publishTenantFeaturesReplace(tenantId, featureCodes);
  }

  private void seedFeatureCodesWithoutPublish(UUID tenantId, List<String> featureCodes) {
    for (String featureCode : featureCodes) {
      sysTenantFeatureMapper.insert(tenantId, featureCode);
    }
  }

  public boolean hasPersonalTenantForEmail(String email) {
    return TenantRlsBypass.call(() -> hasPersonalTenantForEmailWithRlsBypass(email));
  }

  private boolean hasPersonalTenantForEmailWithRlsBypass(String email) {
    var normalizedEmail = EmailNormalizer.normalize(email);
    var users =
        sysUserMapper.selectList(
            Wrappers.<SysUser>lambdaQuery().eq(SysUser::getEmail, normalizedEmail));
    for (var user : users) {
      var tenant = sysTenantMapper.selectById(user.getTenantId());
      if (tenant != null && TenantKind.PERSONAL.equals(tenant.getTenantKind())) {
        return true;
      }
    }
    return false;
  }

  public List<SysTenant> findAllTenants() {
    return findTenants(new AdminListParams(null, null, null)).items();
  }

  public AdminPagedResult<SysTenant> findTenants(AdminListParams params) {
    var wrapper = Wrappers.<SysTenant>lambdaQuery();
    applyTenantSort(wrapper, params);
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

  public List<UUID> findSuspendedTenantIds() {
    return sysTenantMapper
        .selectList(
            Wrappers.<SysTenant>lambdaQuery()
                .eq(SysTenant::getStatus, "suspended")
                .select(SysTenant::getId))
        .stream()
        .map(SysTenant::getId)
        .toList();
  }

  public long countSuspendedTenants() {
    return sysTenantMapper.selectCount(
        Wrappers.<SysTenant>lambdaQuery().eq(SysTenant::getStatus, "suspended"));
  }

  public long countTrialActiveTenants(Instant now) {
    return sysTenantMapper.selectCount(
        Wrappers.<SysTenant>lambdaQuery()
            .and(
                w ->
                    w.isNull(SysTenant::getStatus)
                        .or()
                        .ne(SysTenant::getStatus, "suspended"))
            .isNotNull(SysTenant::getTrialEndsAt)
            .gt(SysTenant::getTrialEndsAt, now));
  }

  public long countTrialExpiredTenants(Instant now) {
    return sysTenantMapper.selectCount(
        Wrappers.<SysTenant>lambdaQuery()
            .and(
                w ->
                    w.isNull(SysTenant::getStatus)
                        .or()
                        .ne(SysTenant::getStatus, "suspended"))
            .isNotNull(SysTenant::getTrialEndsAt)
            .le(SysTenant::getTrialEndsAt, now));
  }

  public List<UUID> findTrialExpiredActiveTenantIds(Instant now) {
    return sysTenantMapper
        .selectList(
            Wrappers.<SysTenant>lambdaQuery()
                .and(
                    w ->
                        w.isNull(SysTenant::getStatus)
                            .or()
                            .ne(SysTenant::getStatus, "suspended"))
                .isNotNull(SysTenant::getTrialEndsAt)
                .le(SysTenant::getTrialEndsAt, now)
                .select(SysTenant::getId))
        .stream()
        .map(SysTenant::getId)
        .toList();
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

  private void applyTenantSort(
      com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysTenant> wrapper,
      AdminListParams params) {
    var ascending = !params.sortDescending();
    switch (params.normalizedTenantSortBy()) {
      case "slug" -> wrapper.orderBy(true, ascending, SysTenant::getSlug);
      case "createdAt" -> wrapper.orderBy(true, ascending, SysTenant::getCreatedAt);
      default -> wrapper.orderBy(true, ascending, SysTenant::getName);
    }
    wrapper.orderByAsc(SysTenant::getId);
  }
}
