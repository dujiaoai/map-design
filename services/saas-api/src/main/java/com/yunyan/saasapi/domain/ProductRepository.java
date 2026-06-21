package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.SysProduct;
import com.yunyan.saasapi.domain.mapper.SysProductMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
@RequiredArgsConstructor
public class ProductRepository {

  private final SysProductMapper sysProductMapper;

  public List<SysProduct> findAllActive() {
    return sysProductMapper.selectList(
        Wrappers.<SysProduct>lambdaQuery()
            .eq(SysProduct::getStatus, "active")
            .orderByAsc(SysProduct::getName));
  }

  public List<SysProduct> findAll() {
    return sysProductMapper.selectList(
        Wrappers.<SysProduct>lambdaQuery().orderByAsc(SysProduct::getName));
  }

  public boolean existsByCode(String code) {
    if (!StringUtils.hasText(code)) {
      return false;
    }
    return sysProductMapper.selectCount(
            Wrappers.<SysProduct>lambdaQuery().eq(SysProduct::getCode, code.trim()))
        > 0;
  }

  public void insert(SysProduct product) {
    sysProductMapper.insert(product);
  }

  public Optional<SysProduct> findById(UUID id) {
    return Optional.ofNullable(sysProductMapper.selectById(id));
  }

  public Optional<SysProduct> findByCode(String code) {
    if (!StringUtils.hasText(code)) {
      return Optional.empty();
    }
    return Optional.ofNullable(
        sysProductMapper.selectOne(
            Wrappers.<SysProduct>lambdaQuery()
                .eq(SysProduct::getCode, code.trim())
                .last("LIMIT 1")));
  }
}
