package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuItem;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuSection;
import com.yunyan.saasapi.domain.mapper.WorkspaceMenuItemMapper;
import com.yunyan.saasapi.domain.mapper.WorkspaceMenuSectionMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class WorkspaceMenuRepository {

  private final WorkspaceMenuSectionMapper sectionMapper;
  private final WorkspaceMenuItemMapper itemMapper;

  public boolean hasPersistedData() {
    return sectionMapper.selectCount(Wrappers.emptyWrapper()) > 0;
  }

  public List<WorkspaceMenuSection> findAllSectionsOrdered() {
    return sectionMapper.selectList(
        Wrappers.<WorkspaceMenuSection>lambdaQuery()
            .orderByAsc(WorkspaceMenuSection::getSortOrder)
            .orderByAsc(WorkspaceMenuSection::getId));
  }

  public List<WorkspaceMenuItem> findAllItemsOrdered() {
    return itemMapper.selectList(
        Wrappers.<WorkspaceMenuItem>lambdaQuery()
            .orderByAsc(WorkspaceMenuItem::getSortOrder)
            .orderByAsc(WorkspaceMenuItem::getId));
  }

  public List<WorkspaceMenuSection> findEnabledSectionsOrdered() {
    return sectionMapper.selectList(
        Wrappers.<WorkspaceMenuSection>lambdaQuery()
            .eq(WorkspaceMenuSection::getEnabled, true)
            .orderByAsc(WorkspaceMenuSection::getSortOrder)
            .orderByAsc(WorkspaceMenuSection::getId));
  }

  public List<WorkspaceMenuItem> findEnabledItemsBySection(String sectionId) {
    return itemMapper.selectList(
        Wrappers.<WorkspaceMenuItem>lambdaQuery()
            .eq(WorkspaceMenuItem::getSectionId, sectionId)
            .eq(WorkspaceMenuItem::getEnabled, true)
            .orderByAsc(WorkspaceMenuItem::getSortOrder)
            .orderByAsc(WorkspaceMenuItem::getId));
  }

  public List<WorkspaceMenuItem> findEnabledToolItemsOrdered() {
    return itemMapper.selectList(
        Wrappers.<WorkspaceMenuItem>lambdaQuery()
            .isNull(WorkspaceMenuItem::getSectionId)
            .eq(WorkspaceMenuItem::getEnabled, true)
            .orderByAsc(WorkspaceMenuItem::getSortOrder)
            .orderByAsc(WorkspaceMenuItem::getId));
  }

  public void updateSection(WorkspaceMenuSection section) {
    sectionMapper.updateById(section);
  }

  public void updateItem(WorkspaceMenuItem item) {
    itemMapper.updateById(item);
  }

  public boolean itemExists(String itemId) {
    return itemMapper.selectById(itemId) != null;
  }
}
