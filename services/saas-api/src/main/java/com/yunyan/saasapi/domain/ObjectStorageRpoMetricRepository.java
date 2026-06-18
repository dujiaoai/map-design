package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.ObjectStorageRpoMetric;
import com.yunyan.saasapi.domain.mapper.ObjectStorageRpoMetricMapper;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ObjectStorageRpoMetricRepository {

  private final ObjectStorageRpoMetricMapper mapper;

  public void insert(ObjectStorageRpoMetric metric) {
    mapper.insert(metric);
  }

  public Optional<ObjectStorageRpoMetric> findLatest() {
    return Optional.ofNullable(
        mapper.selectOne(
            new LambdaQueryWrapper<ObjectStorageRpoMetric>()
                .orderByDesc(ObjectStorageRpoMetric::getRecordedAt)
                .last("LIMIT 1")));
  }
}
