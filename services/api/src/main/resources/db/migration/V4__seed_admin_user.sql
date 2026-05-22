-- Admin user: admin@watchstore.com / Admin123!
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('d1000000-0000-4000-8000-000000000001', 'admin@watchstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'ADMIN');

-- Demo customer: customer@watchstore.com / Customer123!
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('d1000000-0000-4000-8000-000000000002', 'customer@watchstore.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQg3nJ8VqK8Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'Demo', 'Customer', 'CUSTOMER');
