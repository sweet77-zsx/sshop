-- Run this once for databases created before stock_warning was added.
ALTER TABLE cs_shop_config ADD COLUMN stock_warning INT NOT NULL DEFAULT 10 AFTER delivery_tip;
