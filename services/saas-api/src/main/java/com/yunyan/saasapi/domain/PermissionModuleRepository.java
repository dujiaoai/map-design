package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysPermissionModule;
import com.yunyan.saasapi.domain.mapper.SysPermissionModuleMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PermissionModuleRepository {

  private final SysPermissionModuleMapper sysPermissionModuleMapper;

  public List<SysPermissionModule> findAllOrdered() {
    return sysPermissionModuleMapper.selectList(
        Wrappers.<SysPermissionModule>lambdaQuery()
            .orderByAsc(SysPermissionModule::getSortOrder)
            .orderByAsc(SysPermissionModule::getCode));
  }

  public Optional<SysPermissionModule> findById(UUID id) {
    return Optional.ofNullable(sysPermissionModuleMapper.selectById(id));
  }

  public Optional<SysPermissionModule> findByCode(String code) {
    return Optional.ofNullable(
        sysPermissionModuleMapper.selectOne(
            Wrappers.<SysPermissionModule>lambdaQuery().eq(SysPermissionModule::getCode, code)));
  }

  public void insert(SysPermissionModule module) {
    sysPermissionModuleMapper.insert(module);
  }

  public void update(SysPermissionModule module) {
    sysPermissionModuleMapper.updateById(module);
  }

  public void deleteById(UUID id) {
    sysPermissionModuleMapper.deleteById(id);
  }
}
