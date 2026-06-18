package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.AuditWebhookArchive;
import com.yunyan.saasapi.domain.mapper.AuditWebhookArchiveMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class AuditWebhookArchiveRepository {

  private final AuditWebhookArchiveMapper mapper;

  public void insert(AuditWebhookArchive row) {
    mapper.insert(row);
  }

  public long countAll() {
    return mapper.selectCount(null);
  }

  public Map<String, Long> countByRegion() {
    var rows = mapper.selectList(null);
    Map<String, Long> counts = new HashMap<>();
    for (var row : rows) {
      var region = row.getRegion() == null ? "default" : row.getRegion();
      counts.merge(region, 1L, Long::sum);
    }
    return counts;
  }

  public List<AuditWebhookArchive> listRecent(int limit) {
    return mapper.selectList(
        new LambdaQueryWrapper<AuditWebhookArchive>()
            .orderByDesc(AuditWebhookArchive::getArchivedAt)
            .last("LIMIT " + limit));
  }
}
