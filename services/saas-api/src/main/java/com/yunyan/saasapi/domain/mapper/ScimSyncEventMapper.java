package com.yunyan.saasapi.domain.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ScimSyncEventMapper extends BaseMapper<ScimSyncEvent> {}
