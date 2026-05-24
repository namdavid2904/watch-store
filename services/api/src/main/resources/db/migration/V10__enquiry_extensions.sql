ALTER TABLE enquiries
    ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    ADD COLUMN subject VARCHAR(300),
    ADD COLUMN category VARCHAR(50);

CREATE INDEX idx_enquiries_product_id ON enquiries(product_id);
CREATE INDEX idx_enquiries_category ON enquiries(category);
