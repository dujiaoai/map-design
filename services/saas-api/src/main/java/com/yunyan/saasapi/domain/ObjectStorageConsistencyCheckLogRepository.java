package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.ObjectStorageConsistencyCheckLog;
import com.yunyan.saasapi.domain.mapper.ObjectStorageConsistencyCheckLogMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ObjectStorageConsistencyCheckLogRepository {

  private final ObjectStorageConsistencyCheckLogMapper mapper;

  public void insert(ObjectStorageConsistencyCheckLog row) {
    mapper.insert(row);
  }

  public long countAll() {
    return mapper.selectCount(null);
  }

  public long countMismatched() {
    return mapper.selectCount(
        new LambdaQueryWrapper<ObjectStorageConsistencyCheckLog>()
            .eq(ObjectStorageConsistencyCheckLog::getMatched, false));
  }

  public List<ObjectStorageConsistencyCheckLog> listRecentMismatched(int limit) {
    return mapper.selectList(
        new LambdaQueryWrapper<ObjectStorageConsistencyCheckLog>()
            .eq(ObjectStorageConsistencyCheckLog::getMatched, false)
            .orderByDesc(ObjectStorageConsistencyCheckLog::getCheckedAt)
            .last("LIMIT " + limit));
  }
}
