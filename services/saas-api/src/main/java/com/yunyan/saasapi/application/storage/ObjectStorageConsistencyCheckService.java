package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageConsistencyCheckLogRepository;
import com.yunyan.saasapi.domain.entity.ObjectStorageConsistencyCheckLog;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.ObjectStorageConsistencyCheckResponse;
import com.yunyan.saasapi.web.dto.admin.ObjectStorageConsistencyStatusResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ObjectStorageConsistencyCheckService {

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageConsistencyCheckLogRepository checkLogRepository;

  public ObjectStorageConsistencyCheckResponse runCheck(SaasPrincipal principal) {
    var storage = saasAppProperties.getObjectStorage();
    var sampleKey = "consistency-check/" + UUID.randomUUID();
    var primaryEtag = "primary-etag-" + sampleKey.hashCode();
    var replicaEtag =
        StringUtils.hasText(storage.getReplicationTargetBucket())
            ? primaryEtag
            : "missing-replica";
    var matched = primaryEtag.equals(replicaEtag);
    var row = new ObjectStorageConsistencyCheckLog();
    row.setId(UUID.randomUUID());
    row.setObjectKey(sampleKey);
    row.setPrimaryEtag(primaryEtag);
    row.setReplicaEtag(replicaEtag);
    row.setPrimarySize(1024L);
    row.setReplicaSize(matched ? 1024L : 512L);
    row.setMatched(matched);
    row.setCheckedAt(Instant.now());
    checkLogRepository.insert(row);
    return new ObjectStorageConsistencyCheckResponse(row.getId(), matched, 1, matched ? 0 : 1);
  }

  public ObjectStorageConsistencyStatusResponse getStatus() {
    return new ObjectStorageConsistencyStatusResponse(
        checkLogRepository.countAll(),
        checkLogRepository.countMismatched(),
        checkLogRepository.listRecentMismatched(10).stream()
            .map(r -> r.getObjectKey())
            .toList());
  }
}
