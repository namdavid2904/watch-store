-- Re-apply documented dev credentials when V4 was applied before hash fixes.
UPDATE users
SET password_hash = '$2y$10$oMx4P7ufRP0G9IQQLDitXOwFlGd5U/wKzvtuTZHoQOyBG9nhWEgtq'
WHERE id = 'd1000000-0000-4000-8000-000000000001';

UPDATE users
SET password_hash = '$2y$10$Un8R/37uR14ElhHDRCijauK3g1pW7GxScyw5baSg/3cEK1MIc/vBG'
WHERE id = 'd1000000-0000-4000-8000-000000000002';
