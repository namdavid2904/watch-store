-- Admin user: admin@watchstore.com / Admin123!
-- Demo customer: customer@watchstore.com / Customer123!
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('d1000000-0000-4000-8000-000000000001', 'admin@watchstore.com', '$2y$10$oMx4P7ufRP0G9IQQLDitXOwFlGd5U/wKzvtuTZHoQOyBG9nhWEgtq', 'Admin', 'User', 'ADMIN'),
    ('d1000000-0000-4000-8000-000000000002', 'customer@watchstore.com', '$2y$10$Un8R/37uR14ElhHDRCijauK3g1pW7GxScyw5baSg/3cEK1MIc/vBG', 'Demo', 'Customer', 'CUSTOMER');
