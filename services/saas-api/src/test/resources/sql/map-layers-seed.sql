DELETE FROM map_layer
WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102'
);

INSERT INTO map_layer (id, tenant_id, name, layer_type, visible, sort_order) VALUES
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e101', '11111111-1111-1111-1111-111111111101', '专题图层', 'thematic', TRUE, 10),
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e102', '11111111-1111-1111-1111-111111111101', '高清正射', 'ortho', TRUE, 20),
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e103', '11111111-1111-1111-1111-111111111101', '行政区划', 'region', FALSE, 30);

INSERT INTO map_layer (id, tenant_id, name, layer_type, visible, sort_order) VALUES
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e201', '11111111-1111-1111-1111-111111111102', '第二租户图层', 'thematic', TRUE, 0);
