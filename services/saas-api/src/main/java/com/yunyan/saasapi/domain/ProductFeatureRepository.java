package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysProductFeature;
import com.yunyan.saasapi.domain.mapper.SysProductFeatureMapper;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ProductFeatureRepository {

  private final SysProductFeatureMapper sysProductFeatureMapper;

  public List<SysProductFeature> findByProductId(UUID productId) {
    return sysProductFeatureMapper.selectList(
        Wrappers.<SysProductFeature>lambdaQuery()
            .eq(SysProductFeature::getProductId, productId)
            .orderByAsc(SysProductFeature::getCode));
  }

  public Set<String> findCodesByProductId(UUID productId) {
    return new LinkedHashSet<>(sysProductFeatureMapper.selectCodesByProductId(productId));
  }
}
