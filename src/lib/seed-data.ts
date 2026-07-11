import type { Property, Tenant, Payment, MaintenanceRequest, DashboardStats, RevenueData, PaymentInfo, User, SubscriptionPlan } from '@/types';

// ─── Subscription Plans ─────────────────────────────────
export const subscriptionPlans: SubscriptionPlan[] = [
  { tier: 'free', label: 'Free', price: 'Ksh 0', maxUnits: 5, autoReconcile: false, features: ['Up to 5 Units', 'Manual Payment Recording', 'Basic Reports', 'Email Support'] },
  { tier: 'basic', label: 'Basic', price: 'Ksh 2,500', maxUnits: 10, autoReconcile: false, features: ['Up to 10 Units', 'Manual Payment Recording', 'Basic Reporting', 'M-Pesa Integration'] },
  { tier: 'professional', label: 'Professional', price: 'Ksh 7,500', maxUnits: 50, autoReconcile: true, features: ['Up to 50 Units', 'Auto-Reconcile M-Pesa Payments', 'Maintenance Portal', 'Multi-user Access', 'Priority Support'] },
  { tier: 'enterprise', label: 'Enterprise', price: 'Custom', maxUnits: Infinity, autoReconcile: true, features: ['Unlimited Units', 'Auto-Reconcile M-Pesa Payments', 'Dedicated Account Manager', 'Custom Integrations', 'On-site Training'] },
];

// ─── Raw Data ───────────────────────────────────────────
export const rawProfiles = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Admin User', email: 'admin@rentflow.co.ke', phone: '+254712345678', role: 'landlord', national_id: '12345678', avatar: '', subscription: 'free', emergency_contact: '+254722111111', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Premium Landlord', email: 'premium@rentflow.co.ke', phone: '+254712345679', role: 'landlord', national_id: '23456789', avatar: '', subscription: 'professional', emergency_contact: '+254722222222', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Kevin Juma', email: 'kevin@example.com', phone: '+254798765432', role: 'tenant', national_id: '34567890', avatar: '', subscription: 'free', emergency_contact: '+254733333333', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Elizabeth Otieno', email: 'elizabeth.o@gmail.com', phone: '+254711111111', role: 'tenant', national_id: '45678901', avatar: '', subscription: 'free', emergency_contact: '+254722222222', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000005', name: 'John Maina', email: 'j.maina@live.com', phone: '+254733333333', role: 'tenant', national_id: '56789012', avatar: '', subscription: 'free', emergency_contact: '+254744444444', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000006', name: 'Sarah Muthoni', email: 'sarah.muthoni@ke.com', phone: '+254755555555', role: 'tenant', national_id: '67890123', avatar: '', subscription: 'free', emergency_contact: '+254766666666', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000007', name: 'Brian Kiptoo', email: 'b.kiptoo@outlook.com', phone: '+254777777777', role: 'tenant', national_id: '78901234', avatar: '', subscription: 'free', emergency_contact: '+254788888888', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000008', name: 'Sarah Wambui', email: 'sarah@westsidemgt.com', phone: '+254712345600', role: 'manager', national_id: '89012345', avatar: '', subscription: 'professional', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'a0000000-0000-0000-0000-000000000009', name: 'Musa Kamau', email: 'musa@fixers.co.ke', phone: '+254711100200', role: 'caretaker', national_id: '90123456', avatar: '', subscription: 'basic', is_verified: true, created_at: '2024-01-01T00:00:00Z' },
];

export const rawProperties = [
  { id: 'b0000000-0000-0000-0000-000000000001', name: 'Azure Heights', location: 'Westlands, Nairobi', description: 'Modern residential complex with 24 units in the heart of Westlands.', units: 24, type: 'Apartments', status: 'occupied', landlord_id: 'a0000000-0000-0000-0000-000000000001', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop', payment_info: { mpesaPaybill: '247247', mpesaAccount: 'AZURE01', tillNumber: '123456', bankName: 'Equity Bank', bankAccountName: 'Azure Heights Rent Account', bankAccount: '1002003001' }, created_at: '2024-01-01T00:00:00Z' },
  { id: 'b0000000-0000-0000-0000-000000000002', name: 'Emerald Gardens', location: 'Lavington, Nairobi', description: 'Luxury garden apartments with 24-hour security.', units: 12, type: 'Apartments', status: 'occupied', landlord_id: 'a0000000-0000-0000-0000-000000000001', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop', payment_info: { mpesaPaybill: '247247', mpesaAccount: 'EMERALD02', tillNumber: '123456', bankName: 'Equity Bank', bankAccountName: 'Emerald Gardens Rent Account', bankAccount: '1002003002' }, created_at: '2024-01-01T00:00:00Z' },
  { id: 'b0000000-0000-0000-0000-000000000003', name: 'The Skyview', location: 'Kilimani, Nairobi', description: 'High-rise residential tower with panoramic city views.', units: 36, type: 'Apartments', status: 'occupied', landlord_id: 'a0000000-0000-0000-0000-000000000002', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', payment_info: { mpesaPaybill: '247247', mpesaAccount: 'SKYVIEW03', tillNumber: '123456', bankName: 'Equity Bank', bankAccountName: 'Skyview Rent Account', bankAccount: '1002003003' }, created_at: '2024-01-01T00:00:00Z' },
  { id: 'b0000000-0000-0000-0000-000000000004', name: 'Kilimani Gardens', location: 'Kilimani, Nairobi', description: 'Quiet residential garden complex near shopping centers.', units: 12, type: 'Townhouses', status: 'occupied', landlord_id: 'a0000000-0000-0000-0000-000000000002', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop', payment_info: { mpesaPaybill: '247247', mpesaAccount: 'KILIMANI04', tillNumber: '123456', bankName: 'Equity Bank', bankAccountName: 'Kilimani Gardens Rent Account', bankAccount: '1002003004' }, created_at: '2024-01-01T00:00:00Z' },
  { id: 'b0000000-0000-0000-0000-000000000005', name: 'Westlands Plaza', location: 'Westlands, Nairobi', description: 'Mixed-use commercial and residential building.', units: 8, type: 'Studios', status: 'occupied', landlord_id: 'a0000000-0000-0000-0000-000000000001', image: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?w=600&h=400&fit=crop', payment_info: { mpesaPaybill: '247247', mpesaAccount: 'WESTLANDS05', tillNumber: '123456', bankName: 'Equity Bank', bankAccountName: 'Westlands Plaza Rent Account', bankAccount: '1002003005' }, created_at: '2024-01-01T00:00:00Z' },
];

export const rawUnits = [
  { id: 'c0000000-0000-0000-0000-000000000001', property_id: 'b0000000-0000-0000-0000-000000000001', unit_number: 'A-204', type: '2 Bedroom', monthly_rent: 45000, status: 'occupied', tenant_id: 'a0000000-0000-0000-0000-000000000004' },
  { id: 'c0000000-0000-0000-0000-000000000002', property_id: 'b0000000-0000-0000-0000-000000000001', unit_number: 'B-102', type: '3 Bedroom', monthly_rent: 62500, status: 'occupied', tenant_id: 'a0000000-0000-0000-0000-000000000005' },
  { id: 'c0000000-0000-0000-0000-000000000003', property_id: 'b0000000-0000-0000-0000-000000000002', unit_number: 'G-003', type: '1 Bedroom', monthly_rent: 35000, status: 'occupied', tenant_id: 'a0000000-0000-0000-0000-000000000006' },
  { id: 'c0000000-0000-0000-0000-000000000004', property_id: 'b0000000-0000-0000-0000-000000000001', unit_number: 'A-405', type: '2 Bedroom', monthly_rent: 45000, status: 'occupied', tenant_id: 'a0000000-0000-0000-0000-000000000007' },
  { id: 'c0000000-0000-0000-0000-000000000005', property_id: 'b0000000-0000-0000-0000-000000000001', unit_number: 'A-101', type: 'Studio', monthly_rent: 28000, status: 'vacant', tenant_id: null },
  { id: 'c0000000-0000-0000-0000-000000000006', property_id: 'b0000000-0000-0000-0000-000000000002', unit_number: 'G-101', type: '2 Bedroom', monthly_rent: 42000, status: 'vacant', tenant_id: null },
  { id: 'c0000000-0000-0000-0000-000000000007', property_id: 'b0000000-0000-0000-0000-000000000003', unit_number: 'T-1501', type: 'Penthouse', monthly_rent: 120000, status: 'occupied', tenant_id: 'a0000000-0000-0000-0000-000000000003' },
];

export const rawLeases = [
  { id: 'd0000000-0000-0000-0000-000000000001', tenant_id: 'a0000000-0000-0000-0000-000000000004', property_id: 'b0000000-0000-0000-0000-000000000001', unit_id: 'c0000000-0000-0000-0000-000000000001', start_date: '2024-01-01', end_date: '2025-10-12', rent_amount: 45000, deposit_amount: 45000, terms: 'Standard lease terms apply. Tenant responsible for utilities.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
  { id: 'd0000000-0000-0000-0000-000000000002', tenant_id: 'a0000000-0000-0000-0000-000000000007', property_id: 'b0000000-0000-0000-0000-000000000001', unit_id: 'c0000000-0000-0000-0000-000000000004', start_date: '2024-04-01', end_date: '2025-03-15', rent_amount: 45000, deposit_amount: 45000, terms: 'Standard lease terms apply.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
  { id: 'd0000000-0000-0000-0000-000000000003', tenant_id: 'a0000000-0000-0000-0000-000000000003', property_id: 'b0000000-0000-0000-0000-000000000003', unit_id: 'c0000000-0000-0000-0000-000000000007', start_date: '2024-06-01', end_date: '2026-05-31', rent_amount: 120000, deposit_amount: 120000, terms: 'Premium penthouse lease. Includes parking and storage.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
];

export const rawPayments = [
  { id: 'e0000000-0000-0000-0000-000000000001', tenant_id: 'a0000000-0000-0000-0000-000000000004', unit_id: 'c0000000-0000-0000-0000-000000000001', amount: 45000, due_date: '2024-09-01', paid_date: '2024-09-01T05:30:00Z', status: 'paid', method: 'mpesa', transaction_id: 'MPESA001', receipt_id: 'RCP-001' },
  { id: 'e0000000-0000-0000-0000-000000000002', tenant_id: 'a0000000-0000-0000-0000-000000000005', unit_id: 'c0000000-0000-0000-0000-000000000002', amount: 62500, due_date: '2024-09-05', paid_date: null, status: 'pending', method: 'mpesa', transaction_id: 'MPESA002', receipt_id: null },
  { id: 'e0000000-0000-0000-0000-000000000003', tenant_id: 'a0000000-0000-0000-0000-000000000006', unit_id: 'c0000000-0000-0000-0000-000000000003', amount: 35000, due_date: '2024-08-20', paid_date: null, status: 'overdue', method: 'cash', transaction_id: null, receipt_id: null },
  { id: 'e0000000-0000-0000-0000-000000000004', tenant_id: 'a0000000-0000-0000-0000-000000000007', unit_id: 'c0000000-0000-0000-0000-000000000004', amount: 45000, due_date: '2024-09-01', paid_date: '2024-09-01T06:15:00Z', status: 'paid', method: 'mpesa', transaction_id: 'MPESA003', receipt_id: 'RCP-002' },
  { id: 'e0000000-0000-0000-0000-000000000005', tenant_id: 'a0000000-0000-0000-0000-000000000004', unit_id: 'c0000000-0000-0000-0000-000000000001', amount: 45000, due_date: '2024-08-01', paid_date: '2024-08-01T04:45:00Z', status: 'paid', method: 'mpesa', transaction_id: 'MPESA004', receipt_id: 'RCP-003' },
  { id: 'e0000000-0000-0000-0000-000000000006', tenant_id: 'a0000000-0000-0000-0000-000000000007', unit_id: 'c0000000-0000-0000-0000-000000000004', amount: 45000, due_date: '2024-08-01', paid_date: '2024-08-01T07:00:00Z', status: 'paid', method: 'bank', transaction_id: 'BNK001', receipt_id: 'RCP-004' },
  { id: 'e0000000-0000-0000-0000-000000000007', tenant_id: 'a0000000-0000-0000-0000-000000000003', unit_id: 'c0000000-0000-0000-0000-000000000007', amount: 120000, due_date: '2024-09-01', paid_date: '2024-09-01T05:00:00Z', status: 'paid', method: 'mpesa', transaction_id: 'MPESA005', receipt_id: 'RCP-005' },
];

export const rawMaintenance = [
  { id: 'f0000000-0000-0000-0000-000000000001', tenant_id: 'a0000000-0000-0000-0000-000000000004', unit_id: 'c0000000-0000-0000-0000-000000000001', property_id: 'b0000000-0000-0000-0000-000000000001', category: 'plumbing', description: 'Kitchen Sink Leakage — Major leak under the sink affecting flooring.', priority: 'urgent', status: 'submitted', images: [], progress: 0, created_at: '2025-07-10T10:00:00Z' },
  { id: 'f0000000-0000-0000-0000-000000000002', tenant_id: 'a0000000-0000-0000-0000-000000000005', unit_id: 'c0000000-0000-0000-0000-000000000002', property_id: 'b0000000-0000-0000-0000-000000000001', category: 'security', description: 'CCTV Blind Spot — Camera 3 is blocked by overgrown branches.', priority: 'low', status: 'submitted', images: [], progress: 0, created_at: '2025-07-10T07:00:00Z' },
  { id: 'f0000000-0000-0000-0000-000000000003', tenant_id: 'a0000000-0000-0000-0000-000000000006', unit_id: 'c0000000-0000-0000-0000-000000000003', property_id: 'b0000000-0000-0000-0000-000000000002', category: 'electrical', description: 'Circuit Breaker Trip — Living room sockets are non-functional.', priority: 'normal', status: 'assigned', assigned_to: 'Musa K. (Electrician)', images: [], progress: 0, created_at: '2025-07-09T12:00:00Z' },
  { id: 'f0000000-0000-0000-0000-000000000004', tenant_id: 'a0000000-0000-0000-0000-000000000007', unit_id: 'c0000000-0000-0000-0000-000000000004', property_id: 'b0000000-0000-0000-0000-000000000001', category: 'general', description: 'AC Filter Replacement.', priority: 'normal', status: 'in_progress', assigned_to: 'Otieno P. (HVAC)', images: [], progress: 65, created_at: '2025-07-08T12:00:00Z' },
  { id: 'f0000000-0000-0000-0000-000000000005', tenant_id: 'a0000000-0000-0000-0000-000000000004', unit_id: 'c0000000-0000-0000-0000-000000000001', property_id: 'b0000000-0000-0000-0000-000000000001', category: 'general', description: 'Broken Balcony Glass — Replacement installed and sealed.', priority: 'normal', status: 'completed', assigned_to: 'Tech Team', images: [], progress: 100, created_at: '2025-07-07T12:00:00Z', completed_at: '2025-07-08T12:00:00Z' },
];

export const rawNotifications = [
  { id: '77000000-0000-0000-0000-000000000001', user_id: 'a0000000-0000-0000-0000-000000000001', title: 'Rent Payment Received', message: 'KSh 45,000 from Elizabeth Otieno', type: 'payment', is_read: false },
  { id: '77000000-0000-0000-0000-000000000002', user_id: 'a0000000-0000-0000-0000-000000000001', title: 'Maintenance Request', message: 'New urgent request from Unit A-204', type: 'maintenance', is_read: false },
  { id: '77000000-0000-0000-0000-000000000003', user_id: 'a0000000-0000-0000-0000-000000000001', title: 'Lease Expiring Soon', message: 'John Maina lease ends in 30 days', type: 'lease', is_read: true },
  { id: '77000000-0000-0000-0000-000000000004', user_id: 'a0000000-0000-0000-0000-000000000003', title: 'Rent Receipt Available', message: 'Your payment receipt for September is ready', type: 'payment', is_read: false },
  { id: '77000000-0000-0000-0000-000000000005', user_id: 'a0000000-0000-0000-0000-000000000001', title: 'Subscription Renewed', message: 'Professional plan renewed successfully', type: 'alert', is_read: false },
];

// ─── Mutable copies for in-memory CRUD ──────────────────
export const profiles = [...rawProfiles];
export const properties = [...rawProperties];
export const units = [...rawUnits];
export const leases = [...rawLeases];
export const payments = [...rawPayments];
export const maintenance = [...rawMaintenance];
export const notifications = [...rawNotifications];

// ─── Helpers ─────────────────────────────────────────────
export function getProfileName(id: string) {
  return profiles.find((p) => p.id === id)?.name || '';
}
export function getPropertyName(id: string) {
  return properties.find((p) => p.id === id)?.name || '';
}
export function getUnitNumber(id: string) {
  return units.find((u) => u.id === id)?.unit_number || '';
}
