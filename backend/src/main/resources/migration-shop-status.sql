-- Run this once for databases created before shop_status was added.
ALTER TABLE cs_shop_config ADD COLUMN shop_status TINYINT NOT NULL DEFAULT 1 AFTER stock_warning;
