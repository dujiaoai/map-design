package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.ObjectStorageDrDrillLog;
import com.yunyan.saasapi.domain.mapper.ObjectStorageDrDrillLogMapper;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ObjectStorageDrDrillLogRepository {

  private final ObjectStorageDrDrillLogMapper mapper;

  public void insert(ObjectStorageDrDrillLog row) {
    mapper.insert(row);
  }

  public Optional<Instant> findLatestExecutedAt() {
    var rows =
        mapper.selectList(
            new LambdaQueryWrapper<ObjectStorageDrDrillLog>()
                .orderByDesc(ObjectStorageDrDrillLog::getExecutedAt)
                .last("LIMIT 1"));
    if (rows.isEmpty()) {
      return Optional.empty();
    }
    return Optional.ofNullable(rows.get(0).getExecutedAt());
  }
}
