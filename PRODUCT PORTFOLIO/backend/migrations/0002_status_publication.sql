-- Existing schema v3 databases only; run once before deploying the new Worker.
-- Fresh databases use schema.sql instead. History remains immutable.
ALTER TABLE products ADD COLUMN publication_thangs INTEGER DEFAULT NULL CHECK(publication_thangs IN (0,1));
ALTER TABLE products ADD COLUMN publication_makerworld INTEGER DEFAULT NULL CHECK(publication_makerworld IN (0,1));
ALTER TABLE products ADD COLUMN snapshot_json TEXT;
UPDATE products SET stage=CASE stage
 WHEN 'specs' THEN 'specs_ready' WHEN '3mf' THEN '3mf_ready'
 WHEN 'to_print' THEN 'print_ready' WHEN 'printed' THEN 'to_publish'
 ELSE stage END;
