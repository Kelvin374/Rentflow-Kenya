-- RentFlow Kenya — Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor.

-- ─── Profiles ───────────────────────────────────────────
insert into profiles (id, name, email, phone, role, national_id, avatar, subscription, emergency_contact, latitude, longitude, is_verified, is_active, created_at) values
('a0000000-0000-0000-0000-000000000001', 'Admin User',      'admin@rentflow.co.ke',    '+254712345678', 'admin',    '12345678', '', 'professional', '+254722111111', null, null, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000002', 'Premium Landlord', 'premium@rentflow.co.ke',  '+254712345679', 'landlord',  '23456789', '', 'professional', '+254722222222', null, null, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000003', 'Kevin Juma',       'kevin@example.com',       '+254798765432', 'tenant',   '34567890', '', 'free',         '+254733333333', -1.2864, 36.8172, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000004', 'Elizabeth Otieno',  'elizabeth.o@gmail.com',   '+254711111111', 'tenant',   '45678901', '', 'free',         '+254722222222', -1.2641, 36.8035, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000005', 'John Maina',       'j.maina@live.com',        '+254733333333', 'tenant',   '56789012', '', 'free',         '+254744444444', -1.2641, 36.8035, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000006', 'Sarah Muthoni',    'sarah.muthoni@ke.com',    '+254755555555', 'tenant',   '67890123', '', 'free',         '+254766666666', -1.2773, 36.7630, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000007', 'Brian Kiptoo',     'b.kiptoo@outlook.com',    '+254777777777', 'tenant',   '78901234', '', 'free',         '+254788888888', -1.2921, 36.7846, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000008', 'Sarah Wambui',     'sarah@westsidemgt.com',   '+254712345600', 'manager',  '89012345', '', 'professional', '',               null, null, true, true, '2026-01-01T00:00:00Z'),
('a0000000-0000-0000-0000-000000000009', 'Musa Kamau',       'musa@fixers.co.ke',       '+254711100200', 'caretaker','90123456', '', 'basic',        '',               null, null, true, true, '2026-01-01T00:00:00Z')
on conflict (id) do nothing;

-- ─── Properties ─────────────────────────────────────────
insert into properties (id, name, location, description, units, type, status, landlord_id, image, latitude, longitude, payment_info, created_at) values
('b0000000-0000-0000-0000-000000000001', 'Azure Heights',    'Westlands, Nairobi',  'Modern residential complex with 24 units in the heart of Westlands.', 24, 'Apartments',   'occupied', 'a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', -1.2641, 36.8035, '{"mpesaPaybill":"247247","mpesaAccount":"AZURE01","tillNumber":"123456","bankName":"Equity Bank","bankAccountName":"Azure Heights Rent Account","bankAccount":"1002003001"}', '2026-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000002', 'Emerald Gardens',  'Lavington, Nairobi',  'Luxury garden apartments with 24-hour security.',                     12, 'Apartments',   'occupied', 'a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', -1.2773, 36.7630, '{"mpesaPaybill":"247247","mpesaAccount":"EMERALD02","tillNumber":"123456","bankName":"Equity Bank","bankAccountName":"Emerald Gardens Rent Account","bankAccount":"1002003002"}', '2026-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000003', 'The Skyview',      'Kilimani, Nairobi',   'High-rise residential tower with panoramic city views.',              36, 'Apartments',   'occupied', 'a0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', -1.2921, 36.7846, '{"mpesaPaybill":"247247","mpesaAccount":"SKYVIEW03","tillNumber":"123456","bankName":"Equity Bank","bankAccountName":"Skyview Rent Account","bankAccount":"1002003003"}', '2026-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000004', 'Kilimani Gardens', 'Kilimani, Nairobi',   'Quiet residential garden complex near shopping centers.',              12, 'Townhouses',   'occupied', 'a0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop', -1.2890, 36.7870, '{"mpesaPaybill":"247247","mpesaAccount":"KILIMANI04","tillNumber":"123456","bankName":"Equity Bank","bankAccountName":"Kilimani Gardens Rent Account","bankAccount":"1002003004"}', '2026-01-01T00:00:00Z'),
('b0000000-0000-0000-0000-000000000005', 'Westlands Plaza',  'Westlands, Nairobi',  'Mixed-use commercial and residential building.',                       8, 'Studios',      'occupied', 'a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=600&h=400&fit=crop', -1.2620, 36.8050, '{"mpesaPaybill":"247247","mpesaAccount":"WESTLANDS05","tillNumber":"123456","bankName":"Equity Bank","bankAccountName":"Westlands Plaza Rent Account","bankAccount":"1002003005"}', '2026-01-01T00:00:00Z');

-- ─── Units ──────────────────────────────────────────────
insert into units (id, property_id, unit_number, type, monthly_rent, status, tenant_id) values
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'A-204',  '2 Bedroom',  45000, 'occupied', 'a0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'B-102',  '3 Bedroom',  62500, 'occupied', 'a0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'G-003',  '1 Bedroom',  35000, 'occupied', 'a0000000-0000-0000-0000-000000000006'),
('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'A-405',  '2 Bedroom',  45000, 'occupied', 'a0000000-0000-0000-0000-000000000007'),
('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'A-101',  'Studio',     28000, 'vacant',   null),
('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'G-101',  '2 Bedroom',  42000, 'vacant',   null),
('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'T-1501', 'Penthouse', 120000, 'occupied', 'a0000000-0000-0000-0000-000000000003');

-- ─── Leases ─────────────────────────────────────────────
insert into leases (id, tenant_id, property_id, unit_id, start_date, end_date, rent_amount, deposit_amount, terms, status, signed_by_tenant, signed_by_landlord) values
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '2026-01-01', '2027-10-12', 45000, 45000, 'Standard lease terms apply. Tenant responsible for utilities.', 'active', true, true),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '2026-04-01', '2027-03-15', 45000, 45000, 'Standard lease terms apply.', 'active', true, true),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007', '2026-06-01', '2028-05-31', 120000, 120000, 'Premium penthouse lease. Includes parking and storage.', 'active', true, true);

-- ─── Payments ───────────────────────────────────────────
insert into payments (id, tenant_id, unit_id, amount, due_date, paid_date, status, method, transaction_id, receipt_id) values
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 45000, '2026-09-01', '2026-09-01T05:30:00Z', 'paid',    'mpesa', 'MPESA001', 'RCP-001'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 62500, '2026-09-05', null,                 'pending', 'mpesa', 'MPESA002', null),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 35000, '2026-08-20', null,                 'overdue', 'cash',  null,       null),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 45000, '2026-09-01', '2026-09-01T06:15:00Z', 'paid',    'mpesa', 'MPESA003', 'RCP-002'),
('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 45000, '2026-08-01', '2026-08-01T04:45:00Z', 'paid',    'mpesa', 'MPESA004', 'RCP-003'),
('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 45000, '2026-08-01', '2026-08-01T07:00:00Z', 'paid',    'bank',  'BNK001',   'RCP-004'),
('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000007', 120000, '2026-09-01', '2026-09-01T05:00:00Z', 'paid',    'mpesa', 'MPESA005', 'RCP-005');

-- ─── Maintenance Requests ───────────────────────────────
insert into maintenance_requests (id, tenant_id, unit_id, property_id, category, description, priority, status, assigned_to, images, progress, created_at, completed_at, cost) values
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'plumbing',  'Kitchen Sink Leakage — Major leak under the sink affecting flooring.', 'urgent',   'submitted',  null,                   '[]', 0,   '2025-07-10T10:00:00Z', null, null),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'security',  'CCTV Blind Spot — Camera 3 is blocked by overgrown branches.',         'low',       'submitted',  null,                   '[]', 0,   '2025-07-10T07:00:00Z', null, null),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'electrical','Circuit Breaker Trip — Living room sockets are non-functional.',      'normal',   'assigned',   'Musa K. (Electrician)', '[]', 0,   '2025-07-09T12:00:00Z', null, null),
('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'general',   'AC Filter Replacement.',                                               'normal',   'in_progress','Otieno P. (HVAC)',     '[]', 65,  '2025-07-08T12:00:00Z', null, null),
('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'general',   'Broken Balcony Glass — Replacement installed and sealed.',            'normal',   'completed',  'Tech Team',            '[]', 100, '2025-07-07T12:00:00Z', '2025-07-08T12:00:00Z', null);

-- ─── Notifications ──────────────────────────────────────
insert into notifications (id, user_id, title, message, type, is_read) values
('77000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Rent Payment Received',       'KSh 45,000 from Elizabeth Otieno',       'payment',    false),
('77000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Maintenance Request',          'New urgent request from Unit A-204',     'maintenance',false),
('77000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Lease Expiring Soon',          'John Maina lease ends in 30 days',       'lease',      true),
('77000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Rent Receipt Available',       'Your payment receipt for September is ready', 'payment', false),
('77000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Subscription Renewed',         'Professional plan renewed successfully', 'alert',      false);
