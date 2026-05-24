ALTER TABLE products
    ADD COLUMN model_3d_url VARCHAR(500),
    ADD COLUMN gallery_images JSONB NOT NULL DEFAULT '[]';
