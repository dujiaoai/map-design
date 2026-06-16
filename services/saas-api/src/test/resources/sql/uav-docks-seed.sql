DELETE FROM uav_dock
WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102'
);

INSERT INTO uav_dock (id, tenant_id, name, location_label, drone_count, status, battery_percent, sort_order) VALUES
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f101', '11111111-1111-1111-1111-111111111101', '机库-HZ-01', '西湖区 · 龙井路', 2, 'online', 86, 10),
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f102', '11111111-1111-1111-1111-111111111101', '机库-HZ-03', '滨江区 · 网商路', 1, 'online', 62, 20),
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f103', '11111111-1111-1111-1111-111111111101', '机库-HZ-05', '萧山区 · 机场大道', 3, 'offline', NULL, 30);

INSERT INTO uav_dock (id, tenant_id, name, location_label, drone_count, status, battery_percent, sort_order) VALUES
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f201', '11111111-1111-1111-1111-111111111102', '第二租户机库', '其它区', 1, 'online', 50, 0);
