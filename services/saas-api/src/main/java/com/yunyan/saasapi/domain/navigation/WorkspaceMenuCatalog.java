package com.yunyan.saasapi.domain.navigation;

import java.util.List;

/** 工作台侧栏/命令面板菜单目录，与 saas-web mock-nav-items 对齐。 */
public final class WorkspaceMenuCatalog {

  public record MenuItemDef(
      String id,
      String title,
      String kind,
      String icon,
      String toolId,
      String moduleId,
      String url,
      String href,
      String tenantFeature) {

    public static MenuItemDef tool(
        String id, String title, String icon, String toolId) {
      return new MenuItemDef(id, title, "map-tool", icon, toolId, null, null, null, null);
    }

    public static MenuItemDef module(
        String id, String title, String icon, String moduleId, String tenantFeature) {
      return new MenuItemDef(
          id, title, "map-module", icon, null, moduleId, null, null, tenantFeature);
    }

    public static MenuItemDef dockModule(String id, String title, String icon, String moduleId) {
      return new MenuItemDef(
          id, title, "map-dock-module", icon, null, moduleId, null, null, null);
    }

    public static MenuItemDef route(String id, String title, String icon, String url) {
      return new MenuItemDef(id, title, "route", icon, null, null, url, null, null);
    }

    public static MenuItemDef external(String id, String title, String icon, String href) {
      return new MenuItemDef(id, title, "external", icon, null, null, null, href, null);
    }
  }

  public record SectionDef(
      String id,
      String label,
      boolean collapsible,
      boolean defaultOpen,
      String storageKey,
      List<MenuItemDef> items) {}

  public static final List<MenuItemDef> TOOL_ITEMS =
      List.of(
          MenuItemDef.tool("tool-measure-distance", "测距", "Ruler", "measure-distance"),
          MenuItemDef.tool("tool-measure-area", "测面", "LandPlot", "measure-area"),
          MenuItemDef.tool("tool-plot-point", "绘点", "CircleDot", "plot-point"),
          MenuItemDef.tool("tool-draw-line", "绘线", "Spline", "measure-distance"),
          MenuItemDef.tool("tool-draw-surface", "绘面", "Pentagon", "measure-area"),
          MenuItemDef.tool("tool-pick-point", "点坐标拾取", "Crosshair", "pick-point"),
          MenuItemDef.tool("tool-locate-point", "点坐标定位", "LocateFixed", "locate-point"),
          MenuItemDef.tool("tool-swipe-compare", "卷帘对比", "Columns2", "swipe-compare"),
          MenuItemDef.tool(
              "tool-hd-image-compare", "高清影像对比", "Satellite", "hd-image-compare"),
          MenuItemDef.tool("tool-import-file", "导入", "FileUp", "import-file"),
          MenuItemDef.tool("tool-global-search", "搜索", "ScanSearch", "global-search"),
          MenuItemDef.tool(
              "tool-admin-divisions", "行政区划", "MapPinned", "admin-divisions"));

  public static final List<SectionDef> SIDEBAR_SECTIONS =
      List.of(
          new SectionDef(
              "layers",
              "图层",
              false,
              true,
              null,
              List.of(
                  MenuItemDef.module("module-thematic", "专题图层", "LayoutGrid", "thematic", null),
                  MenuItemDef.module(
                      "module-scenic-spots", "景点聚类", "Mountain", "scenic-spots", null),
                  MenuItemDef.module("module-legend", "图例", "ListTree", "legend", null))),
          new SectionDef(
              "analysis",
              "分析",
              false,
              true,
              null,
              List.of(
                  MenuItemDef.module(
                      "module-spatial-analysis", "做分析", "BarChart3", "spatial-analysis", null),
                  MenuItemDef.module(
                      "module-property-view", "属性查看", "Eye", "property-view", null),
                  MenuItemDef.module(
                      "module-my-favorites", "我的收藏", "Bookmark", "my-favorites", null))),
          new SectionDef(
              "ops",
              "运营",
              true,
              true,
              "nav-section-ops",
              List.of(
                  MenuItemDef.module(
                      "module-view-project", "看项目", "FolderKanban", "view-project", null),
                  MenuItemDef.module(
                      "module-flight-ledger", "飞行数据", "ClipboardList", "flight-ledger", null),
                  MenuItemDef.module(
                      "module-flight-ai-alerts", "事件", "Sparkles", "flight-ai-alerts", null),
                  MenuItemDef.module(
                      "module-custom-highway-alert",
                      "高速预警",
                      "Route",
                      "custom-highway-alert",
                      "custom.highway-alert"),
                  MenuItemDef.module(
                      "module-custom-live-share",
                      "地图分享",
                      "Share2",
                      "custom-live-share",
                      "custom.live-share"),
                  MenuItemDef.module(
                      "module-video-monitor", "视频监控", "Video", "video-monitor", null))),
          new SectionDef(
              "uav",
              "机库",
              true,
              true,
              "nav-section-uav",
              List.of(
                  MenuItemDef.dockModule(
                      "dock-uav-list", "机库列表", "Warehouse", "uav-list"),
                  MenuItemDef.dockModule(
                      "dock-uav-settings", "机库设置", "Wrench", "uav-settings"),
                  MenuItemDef.dockModule(
                      "dock-uav-collect", "机库收藏", "BookmarkPlus", "uav-collect"))),
          new SectionDef(
              "app",
              "应用",
              true,
              false,
              "nav-section-app",
              List.of(
                  MenuItemDef.route("route-projects", "项目管理", "Briefcase", "/projects"),
                  MenuItemDef.route("route-settings", "组织设置", "Building2", "/settings"),
                  MenuItemDef.external(
                      "ext-docs", "产品文档", "BookOpen", "https://example.com/docs"),
                  MenuItemDef.external(
                      "ext-support", "技术支持", "Headphones", "https://example.com/support"))));

  private WorkspaceMenuCatalog() {}
}
