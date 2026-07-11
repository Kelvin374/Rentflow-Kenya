import type { Property, Tenant, Payment, MaintenanceRequest, DashboardStats, RevenueData, PaymentInfo } from '@/types';
import {
  profiles, properties, units, leases, payments, maintenance,
  getProfileName, getPropertyName, getUnitNumber,
} from './seed-data';

// ─── Properties ──────────────────────────────────────────
export async function fetchProperties(): Promise<Property[]> {
  return properties.map((p) => {
    const propertyUnits = units.filter((u) => u.property_id === p.id);
    const totalUnits = propertyUnits.length || p.units;
    const occupiedUnits = propertyUnits.filter((u) => u.status === 'occupied').length;
    const monthlyRevenue = propertyUnits
      .filter((u) => u.status === 'occupied')
      .reduce((s, u) => s + Number(u.monthly_rent), 0);
    return {
      id: p.id, name: p.name, location: p.location, type: (p as any).type, units: totalUnits,
      occupiedUnits, monthlyRevenue, status: p.status as Property['status'],
      image: (p as any).image, landlordId: p.landlord_id, paymentInfo: p.payment_info as PaymentInfo | undefined,
      createdAt: p.created_at,
    };
  });
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const p = properties.find((x) => x.id === id);
  if (!p) return null;
  const propertyUnits = units.filter((u) => u.property_id === p.id);
  const totalUnits = propertyUnits.length || p.units;
  const occupiedUnits = propertyUnits.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = propertyUnits
    .filter((u) => u.status === 'occupied')
    .reduce((s, u) => s + Number(u.monthly_rent), 0);
  return {
    id: p.id, name: p.name, location: p.location, type: (p as any).type, units: totalUnits,
    occupiedUnits, monthlyRevenue, status: p.status as Property['status'],
    image: (p as any).image, landlordId: p.landlord_id, paymentInfo: p.payment_info as PaymentInfo | undefined,
    createdAt: p.created_at,
  };
}

export async function fetchPropertiesSimple(): Promise<{ id: string; name: string }[]> {
  return properties.map((p) => ({ id: p.id, name: p.name }));
}

export async function createProperty(data: {
  name: string; location: string; description: string; units: number; type?: string;
  landlord_id: string; payment_info: PaymentInfo;
}): Promise<void> {
  properties.push({
    id: crypto.randomUUID(), name: data.name, location: data.location,
    description: data.description, units: data.units, type: data.type || 'Apartments', status: 'vacant',
    landlord_id: data.landlord_id, image: '', payment_info: data.payment_info,
    created_at: new Date().toISOString(),
  });
}

// ─── Tenants ─────────────────────────────────────────────
export async function fetchTenants(): Promise<Tenant[]> {
  const tenantProfiles = profiles.filter((p) => p.role === 'tenant');
  return tenantProfiles.map((t) => {
    const unit = units.find((u) => u.tenant_id === t.id);
    const prop = unit ? properties.find((p) => p.id === unit.property_id) : undefined;
    const tenantPayments = payments.filter((p) => p.tenant_id === t.id);
    const sorted = tenantPayments.sort((a, b) => b.due_date.localeCompare(a.due_date));
    const paymentStatus = sorted.length > 0 ? sorted[0].status as Tenant['status'] : 'pending';
    return {
      id: t.id, name: t.name, email: t.email || '', phone: t.phone || '',
      nationalId: t.national_id || '', unitId: unit?.id || '',
      propertyId: unit?.property_id || '', propertyName: prop?.name || '',
      unitNumber: unit?.unit_number || '', rentAmount: Number(unit?.monthly_rent || 0),
      status: paymentStatus, leaseStart: '', leaseEnd: '',
      emergencyContact: t.emergency_contact || '',
    };
  });
}

export async function fetchTenantById(id: string) {
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return null;
  const unit = units.find((u) => u.tenant_id === id);
  const prop = unit ? properties.find((p) => p.id === unit.property_id) : undefined;
  const tenantPayments = payments.filter((p) => p.tenant_id === id);
  const tenantMaintenance = maintenance.filter((m) => m.tenant_id === id);
  const activeLease = leases.find((l) => l.tenant_id === id && l.status === 'active');
  return {
    ...profile,
    unitNumber: unit?.unit_number || '',
    propertyName: prop?.name || '',
    rentAmount: unit?.monthly_rent || 0,
    emergencyContact: profile.emergency_contact || '',
    payments: tenantPayments.sort((a, b) => b.due_date.localeCompare(a.due_date)),
    maintenance: tenantMaintenance.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
    lease: activeLease || null,
  };
}

export async function createTenant(data: {
  id: string; name: string; email: string; phone: string; nationalId: string;
  propertyId: string; unitNumber: string; rentAmount: number;
  leaseStart: string; leaseEnd: string; emergencyContact: string;
}): Promise<{ error?: string }> {
    profiles.push({
      id: data.id, name: data.name, email: data.email, phone: data.phone,
      national_id: data.nationalId, avatar: '', role: 'tenant', subscription: 'free',
      emergency_contact: data.emergencyContact, is_verified: true,
      created_at: new Date().toISOString(),
    });

  const existingUnit = units.find(
    (u) => u.property_id === data.propertyId && u.unit_number === data.unitNumber
  );

  let unitId: string;
  if (existingUnit) {
    existingUnit.tenant_id = data.id;
    existingUnit.status = 'occupied';
    unitId = existingUnit.id;
  } else {
    const newUnit = {
      id: crypto.randomUUID(), property_id: data.propertyId,
      unit_number: data.unitNumber, type: '1 Bedroom',
      monthly_rent: data.rentAmount, status: 'occupied' as const, tenant_id: data.id,
    };
    units.push(newUnit);
    unitId = newUnit.id;
  }

  if (data.leaseStart && data.leaseEnd) {
    leases.push({
      id: crypto.randomUUID(), tenant_id: data.id, property_id: data.propertyId,
      unit_id: unitId, start_date: data.leaseStart, end_date: data.leaseEnd,
      rent_amount: data.rentAmount, deposit_amount: data.rentAmount,
      terms: 'Standard lease terms apply.', status: 'active',
      signed_by_tenant: true, signed_by_landlord: true,
    });
  }

  return {};
}

// ─── Payments ────────────────────────────────────────────
export async function fetchPayments(): Promise<Payment[]> {
  return payments.map((p) => ({
    id: p.id, tenantId: p.tenant_id,
    tenantName: getProfileName(p.tenant_id),
    amount: Number(p.amount), date: p.due_date,
    status: p.status as Payment['status'],
    method: (p.method || 'mpesa') as Payment['method'],
    transactionId: p.transaction_id ?? undefined,
    receiptId: p.receipt_id ?? undefined,
    unitNumber: getUnitNumber(p.unit_id),
  }));
}

// ─── Maintenance ─────────────────────────────────────────
export async function fetchMaintenance(): Promise<MaintenanceRequest[]> {
  return maintenance.map((m) => ({
    id: m.id, tenantId: m.tenant_id,
    tenantName: getProfileName(m.tenant_id),
    propertyId: m.property_id, propertyName: getPropertyName(m.property_id),
    unitNumber: getUnitNumber(m.unit_id || ''),
    category: m.category as MaintenanceRequest['category'],
    description: m.description, priority: m.priority as MaintenanceRequest['priority'],
    status: m.status as MaintenanceRequest['status'],
    assignedTo: m.assigned_to, images: (m as any).images, createdAt: m.created_at,
    completedAt: (m as any).completed_at, progress: m.progress,
    cost: (m as any).cost ? Number((m as any).cost) : undefined,
  }));
}

export async function fetchMaintenanceById(id: string) {
  const m = maintenance.find((x) => x.id === id);
  if (!m) return null;
  return {
    id: m.id, tenantId: m.tenant_id,
    tenantName: getProfileName(m.tenant_id),
    propertyId: m.property_id, propertyName: getPropertyName(m.property_id),
    unitNumber: getUnitNumber(m.unit_id || ''),
    category: m.category, description: m.description, priority: m.priority,
    status: m.status, assignedTo: m.assigned_to, images: (m as any).images,
    createdAt: m.created_at, completedAt: (m as any).completed_at, progress: m.progress,
    cost: (m as any).cost ? Number((m as any).cost) : undefined,
  };
}

export async function createMaintenanceRequest(data: {
  id: string; tenant_id: string; property_id: string; unit_id: string;
  category: string; description: string; priority: string;
}): Promise<void> {
    (maintenance as any).push({
      id: data.id, tenant_id: data.tenant_id, unit_id: data.unit_id,
      property_id: data.property_id, category: data.category,
      description: data.description, priority: data.priority,
      status: 'submitted', images: [], progress: 0,
      created_at: new Date().toISOString(),
    });
}

export async function updateMaintenanceRequest(id: string, updates: Record<string, any>): Promise<void> {
  const idx = maintenance.findIndex((m) => m.id === id);
  if (idx !== -1) {
    maintenance[idx] = { ...maintenance[idx], ...updates };
  }
}

// ─── Dashboard Stats ─────────────────────────────────────
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const totalProperties = properties.length;
  const allUnits = units;
  const totalUnits = allUnits.length;
  const occupiedUnits = allUnits.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount), 0);
  const overdueAmount = payments
    .filter((p) => p.status === 'overdue')
    .reduce((s, p) => s + Number(p.amount), 0);
  const totalTenants = profiles.filter((p) => p.role === 'tenant').length;
  const activeMaintenance = maintenance.filter(
    (m) => m.status !== 'completed' && m.status !== 'cancelled'
  ).length;

  return {
    totalProperties, totalUnits, occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits, monthlyRevenue,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0,
    pendingPayments, overdueAmount, activeMaintenance, totalTenants,
  };
}

// ─── Revenue Data ────────────────────────────────────────
export async function fetchRevenueData(): Promise<RevenueData[]> {
  const paid = payments.filter((p) => p.status === 'paid' && p.paid_date).sort(
    (a, b) => (a.paid_date || '').localeCompare(b.paid_date || '')
  );
  const months: Record<string, number> = {};
  for (const p of paid) {
    const d = new Date(p.paid_date!);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' }).toUpperCase().replace(' ', "'");
    months[key] = (months[key] || 0) + Number(p.amount);
  }
  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

// ─── Units ───────────────────────────────────────────────
export async function fetchUnitsByProperty(propertyId: string) {
  return units.filter((u) => u.property_id === propertyId).sort((a, b) => a.unit_number.localeCompare(b.unit_number));
}

// ─── Leases ──────────────────────────────────────────────
export async function fetchLeases() {
  return leases.map((l) => ({
    ...l,
    properties: { name: getPropertyName(l.property_id) },
    units: { unit_number: getUnitNumber(l.unit_id) },
  }));
}

// ─── Property detail (joined data for [id] page) ────────
export async function fetchPropertyDetailData(id: string) {
  const prop = properties.find((p) => p.id === id);
  if (!prop) return null;

  const propertyUnits = units.filter((u) => u.property_id === id);
  const tenantIds = propertyUnits.filter((u) => u.tenant_id).map((u) => u.tenant_id as string);

  const tenantProfiles = tenantIds.length > 0
    ? profiles.filter((p) => tenantIds.includes(p.id))
    : [];
  const activeLeases = tenantIds.length > 0
    ? leases.filter((l) => tenantIds.includes(l.tenant_id) && l.status === 'active')
    : [];
  const allPayments = tenantIds.length > 0
    ? payments.filter((p) => tenantIds.includes(p.tenant_id)).sort((a, b) => b.due_date.localeCompare(a.due_date))
    : [];

  const totalUnits = propertyUnits.length || prop.units;
  const occupiedUnits = propertyUnits.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = propertyUnits
    .filter((u) => u.status === 'occupied')
    .reduce((s, u) => s + Number(u.monthly_rent), 0);

  return {
    property: {
      id: prop.id, name: prop.name, location: prop.location, type: (prop as any).type,
      units: totalUnits, occupiedUnits, monthlyRevenue,
      status: prop.status as Property['status'], landlordId: prop.landlord_id,
      paymentInfo: prop.payment_info as PaymentInfo | undefined, createdAt: prop.created_at,
    },
    tenants: tenantProfiles.map((p) => {
      const unit = propertyUnits.find((u) => u.tenant_id === p.id);
      const lastPay = allPayments.find((pay) => pay.tenant_id === p.id);
      return {
        id: p.id, name: p.name, unitNumber: unit?.unit_number || '',
        status: lastPay?.status || 'pending', rentAmount: unit?.monthly_rent || 0,
      };
    }),
    payments: allPayments.map((pay) => {
      const profile = tenantProfiles.find((p) => p.id === pay.tenant_id);
      return {
        id: pay.id, tenantName: profile?.name || '', amount: pay.amount,
        date: pay.due_date, status: pay.status, method: pay.method,
      };
    }),
  };
}

// ─── Lease by ID ──────────────────────────────────────────
export async function fetchLeaseById(id: string) {
  const l = leases.find((x) => x.id === id);
  if (!l) return null;
  const tenant = profiles.find((p) => p.id === l.tenant_id);
  const prop = properties.find((p) => p.id === l.property_id);
  const unit = units.find((u) => u.id === l.unit_id);
  return {
    ...l,
    tenantName: tenant?.name || '',
    tenantEmail: tenant?.email || '',
    tenantPhone: tenant?.phone || '',
    tenantNationalId: tenant?.national_id || '',
    propertyName: prop?.name || '',
    propertyLocation: prop?.location || '',
    unitNumber: unit?.unit_number || '',
    unitType: unit?.type || '',
  };
}

// ─── Tenant Dashboard ────────────────────────────────────
export async function fetchTenantDashboardData(userId: string) {
  const unit = units.find((u) => u.tenant_id === userId);
  const prop = unit ? properties.find((p) => p.id === unit.property_id) : null;
  const lease = leases.find((l) => l.tenant_id === userId && l.status === 'active');
  const maint = maintenance
    .filter((m) => m.tenant_id === userId && m.status !== 'completed')
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 2);
  return { unit: unit || null, property: prop || null, lease: lease || null, maintenance: maint };
}
