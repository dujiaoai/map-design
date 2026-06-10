package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.mapper.SysRoleMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RoleRepository {

  private final SysRoleMapper sysRoleMapper;

  public List<SysRole> findAllOrdered() {
    return sysRoleMapper.selectList(
        Wrappers.<SysRole>lambdaQuery().orderByAsc(SysRole::getCode));
  }

  public Optional<SysRole> findById(UUID roleId) {
    return Optional.ofNullable(sysRoleMapper.selectById(roleId));
  }
}
