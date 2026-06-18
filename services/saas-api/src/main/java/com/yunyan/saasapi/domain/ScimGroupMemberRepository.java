package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.ScimGroupMember;
import com.yunyan.saasapi.domain.mapper.ScimGroupMemberMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimGroupMemberRepository {

  private final ScimGroupMemberMapper mapper;

  public List<ScimGroupMember> listByGroupId(UUID groupId) {
    return mapper.selectList(
        Wrappers.<ScimGroupMember>lambdaQuery().eq(ScimGroupMember::getGroupId, groupId));
  }

  public void insert(ScimGroupMember row) {
    mapper.insert(row);
  }

  public void deleteByGroupId(UUID groupId) {
    mapper.delete(Wrappers.<ScimGroupMember>lambdaQuery().eq(ScimGroupMember::getGroupId, groupId));
  }
}
