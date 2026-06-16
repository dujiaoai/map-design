-- Platform workspace menu template (align with WorkspaceMenuCatalog).
CREATE TABLE workspace_menu_section (
    id            VARCHAR(64)  PRIMARY KEY,
    label         VARCHAR(128) NOT NULL,
    collapsible   BOOLEAN      NOT NULL DEFAULT false,
    default_open  BOOLEAN      NOT NULL DEFAULT true,
    storage_key   VARCHAR(64),
    sort_order    INT          NOT NULL DEFAULT 0,
    enabled       BOOLEAN      NOT NULL DEFAULT true
);

CREATE TABLE workspace_menu_item (
    id              VARCHAR(64)  PRIMARY KEY,
    section_id      VARCHAR(64)  REFERENCES workspace_menu_section (id),
    title           VARCHAR(128) NOT NULL,
    kind            VARCHAR(32)  NOT NULL,
    icon            VARCHAR(64),
    tool_id         VARCHAR(64),
    module_id       VARCHAR(64),
    url             VARCHAR(512),
    href            VARCHAR(512),
    tenant_feature  VARCHAR(128),
    sort_order      INT          NOT NULL DEFAULT 0,
    enabled         BOOLEAN      NOT NULL DEFAULT true
);

CREATE INDEX idx_workspace_menu_item_section ON workspace_menu_item (section_id, sort_order);

INSERT INTO workspace_menu_section (id, label, collapsible, default_open, storage_key, sort_order, enabled)
VALUES
    ('layers', '图层', false, true, NULL, 0, true),
    ('analysis', '分析', false, true, NULL, 1, true),
    ('ops', '运营', true, true, 'nav-section-ops', 2, true),
    ('uav', '机库', true, true, 'nav-section-uav', 3, true),
    ('app', '应用', true, false, 'nav-section-app', 4, true);

INSERT INTO workspace_menu_item (
    id, section_id, title, kind, icon, tool_id, module_id, url, href, tenant_feature, sort_order, enabled
)
VALUES
    ('module-thematic', 'layers', '专题图层', 'map-module', 'LayoutGrid', NULL, 'thematic', NULL, NULL, NULL, 0, true),
    ('module-scenic-spots', 'layers', '景点聚类', 'map-module', 'Mountain', NULL, 'scenic-spots', NULL, NULL, NULL, 1, true),
    ('module-legend', 'layers', '图例', 'map-module', 'ListTree', NULL, 'legend', NULL, NULL, NULL, 2, true),
    ('module-spatial-analysis', 'analysis', '做分析', 'map-module', 'BarChart3', NULL, 'spatial-analysis', NULL, NULL, NULL, 0, true),
    ('module-property-view', 'analysis', '属性查看', 'map-module', 'Eye', NULL, 'property-view', NULL, NULL, NULL, 1, true),
    ('module-my-favorites', 'analysis', '我的收藏', 'map-module', 'Bookmark', NULL, 'my-favorites', NULL, NULL, NULL, 2, true),
    ('module-view-project', 'ops', '看项目', 'map-module', 'FolderKanban', NULL, 'view-project', NULL, NULL, NULL, 0, true),
    ('module-flight-ledger', 'ops', '飞行数据', 'map-module', 'ClipboardList', NULL, 'flight-ledger', NULL, NULL, NULL, 1, true),
    ('module-flight-ai-alerts', 'ops', '事件', 'map-module', 'Sparkles', NULL, 'flight-ai-alerts', NULL, NULL, NULL, 2, true),
    ('module-custom-highway-alert', 'ops', '高速预警', 'map-module', 'Route', NULL, 'custom-highway-alert', NULL, NULL, 'custom.highway-alert', 3, true),
    ('module-custom-live-share', 'ops', '地图分享', 'map-module', 'Share2', NULL, 'custom-live-share', NULL, NULL, 'custom.live-share', 4, true),
    ('module-video-monitor', 'ops', '视频监控', 'map-module', 'Video', NULL, 'video-monitor', NULL, NULL, NULL, 5, true),
    ('dock-uav-list', 'uav', '机库列表', 'map-dock-module', 'Warehouse', NULL, 'uav-list', NULL, NULL, NULL, 0, true),
    ('dock-uav-settings', 'uav', '机库设置', 'map-dock-module', 'Wrench', NULL, 'uav-settings', NULL, NULL, NULL, 1, true),
    ('dock-uav-collect', 'uav', '机库收藏', 'map-dock-module', 'BookmarkPlus', NULL, 'uav-collect', NULL, NULL, NULL, 2, true),
    ('route-projects', 'app', '项目管理', 'route', 'Briefcase', NULL, NULL, '/projects', NULL, NULL, 0, true),
    ('route-settings', 'app', '组织设置', 'route', 'Building2', NULL, NULL, '/settings', NULL, NULL, 1, true),
    ('ext-docs', 'app', '产品文档', 'external', 'BookOpen', NULL, NULL, NULL, 'https://example.com/docs', NULL, 2, true),
    ('ext-support', 'app', '技术支持', 'external', 'Headphones', NULL, NULL, NULL, 'https://example.com/support', NULL, 3, true),
    ('tool-measure-distance', NULL, '测距', 'map-tool', 'Ruler', 'measure-distance', NULL, NULL, NULL, NULL, 0, true),
    ('tool-measure-area', NULL, '测面', 'map-tool', 'LandPlot', 'measure-area', NULL, NULL, NULL, NULL, 1, true),
    ('tool-plot-point', NULL, '绘点', 'map-tool', 'CircleDot', 'plot-point', NULL, NULL, NULL, NULL, 2, true),
    ('tool-draw-line', NULL, '绘线', 'map-tool', 'Spline', 'measure-distance', NULL, NULL, NULL, NULL, 3, true),
    ('tool-draw-surface', NULL, '绘面', 'map-tool', 'Pentagon', 'measure-area', NULL, NULL, NULL, NULL, 4, true),
    ('tool-pick-point', NULL, '点坐标拾取', 'map-tool', 'Crosshair', 'pick-point', NULL, NULL, NULL, NULL, 5, true),
    ('tool-locate-point', NULL, '点坐标定位', 'map-tool', 'LocateFixed', 'locate-point', NULL, NULL, NULL, NULL, 6, true),
    ('tool-swipe-compare', NULL, '卷帘对比', 'map-tool', 'Columns2', 'swipe-compare', NULL, NULL, NULL, NULL, 7, true),
    ('tool-hd-image-compare', NULL, '高清影像对比', 'map-tool', 'Satellite', 'hd-image-compare', NULL, NULL, NULL, NULL, 8, true),
    ('tool-import-file', NULL, '导入', 'map-tool', 'FileUp', 'import-file', NULL, NULL, NULL, NULL, 9, true),
    ('tool-global-search', NULL, '搜索', 'map-tool', 'ScanSearch', 'global-search', NULL, NULL, NULL, NULL, 10, true),
    ('tool-admin-divisions', NULL, '行政区划', 'map-tool', 'MapPinned', 'admin-divisions', NULL, NULL, NULL, NULL, 11, true);

-- Admin menu configuration permissions.
INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000009', 'admin_menus', '工作台菜单', '平台工作台侧栏与命令面板菜单配置', 'platform', TRUE, 46
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_menus');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000018', 'admin:menus:read', '查看菜单配置', '查看工作台菜单模板', 'platform',
       '20000000-0000-0000-0000-000000000009', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:menus:read');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000019', 'admin:menus:write', '编辑菜单配置', '修改工作台菜单模板', 'platform',
       '20000000-0000-0000-0000-000000000009', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:menus:write');

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.code IN ('admin:menus:read', 'admin:menus:write')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );
