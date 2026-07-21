import type { Property, Tenant, Payment, MaintenanceRequest, DashboardStats, RevenueData, PaymentInfo } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { haversineDistance, geocodeLocation, type GeoPoint } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────
const PROP_COLS = 'id, name, location, description, units, type, status, landlord_id, image, images, payment_info, created_at';
const PROP_COLS_WITH_COORDS = 'id, name, location, description, units, type, status, landlord_id, image, images, payment_info, latitude, longitude, created_at';
const PROP_COLS_SAFE = 'id, name, location, description, units, type, status, landlord_id, image, payment_info, created_at';

let _hasCoords = true;

async function queryProperties(selectCols: string): Promise<{ data: any[] | null; error: any; hasCoords: boolean }> {
  const { data, error } = await supabase.from('properties').select(selectCols);
  if (error && selectCols === PROP_COLS_WITH_COORDS) {
    _hasCoords = false;
    const fallback = await supabase.from('properties').select(PROP_COLS);
    return { data: fallback.data, error: fallback.error, hasCoords: false };
  }
  return { data, error, hasCoords: _hasCoords };
}

const DEMO_ACCOUNT_PREFIXES = ['a0000000-'];
export function isDemoAccount(userId: string): boolean {
  return DEMO_ACCOUNT_PREFIXES.some((prefix) => userId.startsWith(prefix));
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\+?[\d\s-]{7,15}$/.test(phone);
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
}

// ─── Demo Data Seeding ───────────────────────────────────
export async function seedDemoDataForLandlord(landlordId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', landlordId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const propId1 = crypto.randomUUID();
  const propId2 = crypto.randomUUID();
  const unitIds = Array.from({ length: 6 }, () => crypto.randomUUID());
  const tenantIds = Array.from({ length: 4 }, () => crypto.randomUUID());

  await supabase.from('properties').insert([
    {
      id: propId1, name: 'Sunset Apartments', location: 'Kilimani, Nairobi',
      description: 'Modern 6-unit apartment block close to Yaya Centre.', units: 6,
      type: 'Apartments', status: 'occupied', landlord_id: landlordId, image: '',
      latitude: -1.2921, longitude: 36.7846,
      payment_info: { mpesaPaybill: '123456', mpesaAccount: 'SUNSET', tillNumber: '', bankName: 'KCB', bankAccountName: 'Sunset Apts', bankAccount: '11223344', rentAmount: 35000, depositAmount: 35000 },
      created_at: new Date().toISOString(),
    },
    {
      id: propId2, name: 'Riverside Villas', location: 'Westlands, Nairobi',
      description: 'Quiet gated community with 4 townhouses.', units: 4,
      type: 'Townhouses', status: 'occupied', landlord_id: landlordId, image: '',
      latitude: -1.2641, longitude: 36.8035,
      payment_info: { mpesaPaybill: '654321', mpesaAccount: 'RIVER', tillNumber: '', bankName: 'Equity', bankAccountName: 'Riverside Villas', bankAccount: '55667788', rentAmount: 80000, depositAmount: 80000 },
      created_at: new Date().toISOString(),
    },
  ]);

  const units = [
    { id: unitIds[0], property_id: propId1, unit_number: 'SA-101', type: '1 Bedroom', monthly_rent: 35000, status: 'occupied', tenant_id: tenantIds[0] },
    { id: unitIds[1], property_id: propId1, unit_number: 'SA-102', type: '2 Bedroom', monthly_rent: 50000, status: 'occupied', tenant_id: tenantIds[1] },
    { id: unitIds[2], property_id: propId1, unit_number: 'SA-201', type: '1 Bedroom', monthly_rent: 35000, status: 'occupied', tenant_id: tenantIds[2] },
    { id: unitIds[3], property_id: propId1, unit_number: 'SA-202', type: 'Studio', monthly_rent: 25000, status: 'vacant', tenant_id: null },
    { id: unitIds[4], property_id: propId2, unit_number: 'RV-A', type: '3 Bedroom', monthly_rent: 80000, status: 'occupied', tenant_id: tenantIds[3] },
    { id: unitIds[5], property_id: propId2, unit_number: 'RV-B', type: '3 Bedroom', monthly_rent: 80000, status: 'vacant', tenant_id: null },
  ];
  await supabase.from('units').insert(units);

  const now = new Date().toISOString();
  const profiles = [
    { id: tenantIds[0], name: 'Amina Hassan', email: 'amina@example.com', phone: '+254700100200', role: 'tenant', national_id: '10001001', avatar: '', subscription: 'free', emergency_contact: '+254700100201', is_verified: true, is_active: true, created_at: now },
    { id: tenantIds[1], name: 'David Ochieng', email: 'david.o@example.com', phone: '+254700200300', role: 'tenant', national_id: '20002002', avatar: '', subscription: 'free', emergency_contact: '+254700200301', is_verified: true, is_active: true, created_at: now },
    { id: tenantIds[2], name: 'Grace Wanjiku', email: 'grace.w@example.com', phone: '+254700300400', role: 'tenant', national_id: '30003003', avatar: '', subscription: 'free', emergency_contact: '+254700300401', is_verified: true, is_active: true, created_at: now },
    { id: tenantIds[3], name: 'Peter Mutua', email: 'peter.m@example.com', phone: '+254700400500', role: 'tenant', national_id: '40004004', avatar: '', subscription: 'free', emergency_contact: '+254700400501', is_verified: true, is_active: true, created_at: now },
  ];
  await supabase.from('profiles').insert(profiles);

  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const past = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return d; };
  const future = (days: number) => { const d = new Date(today); d.setDate(d.getDate() + days); return d; };

  await supabase.from('leases').insert([
    { tenant_id: tenantIds[0], property_id: propId1, unit_id: unitIds[0], start_date: fmt(past(300)), end_date: fmt(future(60)), rent_amount: 35000, deposit_amount: 35000, terms: 'Standard lease.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
    { tenant_id: tenantIds[1], property_id: propId1, unit_id: unitIds[1], start_date: fmt(past(180)), end_date: fmt(future(180)), rent_amount: 50000, deposit_amount: 50000, terms: 'Standard lease.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
    { tenant_id: tenantIds[2], property_id: propId1, unit_id: unitIds[2], start_date: fmt(past(90)), end_date: fmt(future(270)), rent_amount: 35000, deposit_amount: 35000, terms: 'Standard lease.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
    { tenant_id: tenantIds[3], property_id: propId2, unit_id: unitIds[4], start_date: fmt(past(60)), end_date: fmt(future(300)), rent_amount: 80000, deposit_amount: 80000, terms: 'Standard lease.', status: 'active', signed_by_tenant: true, signed_by_landlord: true },
  ]);

  await supabase.from('payments').insert([
    { tenant_id: tenantIds[0], unit_id: unitIds[0], amount: 35000, due_date: fmt(past(0)), status: 'paid', method: 'mpesa', paid_date: past(0).toISOString(), transaction_id: 'MP001', receipt_id: 'R001' },
    { tenant_id: tenantIds[0], unit_id: unitIds[0], amount: 35000, due_date: fmt(past(30)), status: 'paid', method: 'mpesa', paid_date: past(29).toISOString(), transaction_id: 'MP002', receipt_id: 'R002' },
    { tenant_id: tenantIds[1], unit_id: unitIds[1], amount: 50000, due_date: fmt(past(0)), status: 'pending', method: 'mpesa', paid_date: null, transaction_id: null, receipt_id: null },
    { tenant_id: tenantIds[2], unit_id: unitIds[2], amount: 35000, due_date: fmt(past(5)), status: 'overdue', method: 'bank', paid_date: null, transaction_id: null, receipt_id: null },
    { tenant_id: tenantIds[3], unit_id: unitIds[4], amount: 80000, due_date: fmt(past(0)), status: 'paid', method: 'mpesa', paid_date: past(1).toISOString(), transaction_id: 'MP003', receipt_id: 'R003' },
  ]);

  await supabase.from('maintenance_requests').insert([
    { tenant_id: tenantIds[0], unit_id: unitIds[0], property_id: propId1, category: 'plumbing', description: 'Bathroom tap dripping constantly.', priority: 'normal', status: 'submitted', images: [], progress: 0, created_at: past(2).toISOString() },
    { tenant_id: tenantIds[1], unit_id: unitIds[1], property_id: propId1, category: 'electrical', description: 'Power surges in the kitchen area.', priority: 'urgent', status: 'in_progress', assigned_to: 'City Electricians Ltd', images: [], progress: 40, created_at: past(5).toISOString() },
  ]);
}

export async function seedDemoDataForTenant(tenantId: string, tenantName: string): Promise<void> {
  const { data: existingUnit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', tenantId)
    .limit(1);

  if (existingUnit && existingUnit.length > 0) return;

  let propId: string;
  let propUnitCount: number;
  const { data: firstProp } = await supabase.from('properties').select('id, units').limit(1).single();

  if (firstProp) {
    propId = firstProp.id;
    propUnitCount = firstProp.units || 6;
  } else {
    propId = crypto.randomUUID();
    propUnitCount = 6;
    await supabase.from('properties').insert({
      id: propId, name: 'Starter Complex', location: 'CBD, Nairobi',
      description: 'Affordable city-centre apartments.', units: propUnitCount,
      type: 'Apartments', status: 'occupied', landlord_id: null, image: '',
      latitude: -1.2864, longitude: 36.8172,
      payment_info: { mpesaPaybill: '999999', mpesaAccount: 'START', tillNumber: '', bankName: 'Coop Bank', bankAccountName: 'Starter Complex', bankAccount: '11220033', rentAmount: 30000, depositAmount: 30000 },
      created_at: new Date().toISOString(),
    });
  }

  const unitId = crypto.randomUUID();
  const unitNum = `T-${Math.floor(Math.random() * 900 + 100)}`;
  await supabase.from('units').insert({
    id: unitId, property_id: propId, unit_number: unitNum, type: '1 Bedroom',
    monthly_rent: 30000, status: 'occupied', tenant_id: tenantId,
  });

  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const past = (days: number) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
  const future = (days: number) => { const d = new Date(now); d.setDate(d.getDate() + days); return d; };

  await supabase.from('leases').insert({
    tenant_id: tenantId, property_id: propId, unit_id: unitId,
    start_date: fmt(past(30)), end_date: fmt(future(335)),
    rent_amount: 30000, deposit_amount: 30000,
    terms: 'Standard lease terms. Tenant responsible for utilities.',
    status: 'active', signed_by_tenant: true, signed_by_landlord: true,
  });

  await supabase.from('payments').insert([
    { tenant_id: tenantId, unit_id: unitId, amount: 30000, due_date: fmt(past(0)), status: 'pending', method: 'mpesa', paid_date: null, transaction_id: null, receipt_id: null },
    { tenant_id: tenantId, unit_id: unitId, amount: 30000, due_date: fmt(past(30)), status: 'paid', method: 'mpesa', paid_date: past(28).toISOString(), transaction_id: 'MPDEMO1', receipt_id: 'RDEMO1' },
  ]);

  await supabase.from('maintenance_requests').insert({
    tenant_id: tenantId, unit_id: unitId, property_id: propId,
    category: 'general', description: 'Welcome maintenance check — please verify all fixtures.',
    priority: 'low', status: 'submitted', images: [], progress: 0,
    created_at: now.toISOString(),
  });
}

// ─── Properties ──────────────────────────────────────────
export async function fetchProperties(landlordId?: string): Promise<Property[]> {
  const { data: allProps, error, hasCoords } = await queryProperties(PROP_COLS_WITH_COORDS);

  if (error || !allProps) return [];

  const props = landlordId ? allProps.filter((p: any) => p.landlord_id === landlordId) : allProps;

  const propertyIds = props.map((p: any) => p.id);
  const { data: allUnits } = await supabase
    .from('units')
    .select('*')
    .in('property_id', propertyIds);

  const unitsByProperty = new Map<string, any[]>();
  for (const u of allUnits || []) {
    const list = unitsByProperty.get(u.property_id) || [];
    list.push(u);
    unitsByProperty.set(u.property_id, list);
  }

  return props.map((p: any) => {
    const propertyUnits = unitsByProperty.get(p.id) || [];
    const totalUnits = propertyUnits.length || p.units;
    const occupiedUnits = propertyUnits.filter((u: any) => u.status === 'occupied').length;
    const monthlyRevenue = propertyUnits
      .filter((u: any) => u.status === 'occupied')
      .reduce((s: number, u: any) => s + Number(u.monthly_rent), 0);
    return {
      id: p.id, name: p.name, location: p.location, description: p.description, type: p.type, units: totalUnits,
      occupiedUnits, monthlyRevenue, status: p.status,
      image: p.image, images: Array.isArray(p.images) ? p.images : [], landlordId: p.landlord_id,
      latitude: p.latitude ?? undefined, longitude: p.longitude ?? undefined,
      paymentInfo: (typeof p.payment_info === 'string' ? JSON.parse(p.payment_info) : p.payment_info) as PaymentInfo | undefined,
      createdAt: p.created_at,
    };
  });
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  let p: any = null;

  const first = await supabase
    .from('properties')
    .select(PROP_COLS)
    .eq('id', id)
    .single();

  if (first.error || !first.data) {
    const retry = await supabase
      .from('properties')
      .select(PROP_COLS_SAFE)
      .eq('id', id)
      .single();
    p = retry.data;
  } else {
    p = first.data;
  }

  if (!p) return null;

  const { data: propertyUnits } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', id);

  const units = propertyUnits || [];
  const totalUnits = units.length || p.units;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = units
    .filter((u) => u.status === 'occupied')
    .reduce((s, u) => s + Number(u.monthly_rent), 0);

    return {
      id: p.id, name: p.name, location: p.location, description: p.description, type: p.type, units: totalUnits,
      occupiedUnits, monthlyRevenue, status: p.status,
      image: p.image, images: Array.isArray(p.images) ? p.images : [], landlordId: p.landlord_id,
      latitude: p.latitude ?? undefined, longitude: p.longitude ?? undefined,
      paymentInfo: (typeof p.payment_info === 'string' ? JSON.parse(p.payment_info) : p.payment_info) as PaymentInfo | undefined,
      createdAt: p.created_at,
    };
}

export async function fetchPropertiesSimple(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('id, name');

  if (error || !data) return [];
  return data;
}

export async function fetchNearbyProperties(
  userLat: number,
  userLng: number,
  radiusKm: number = 15,
  limit: number = 10,
): Promise<Property[]> {
  const { data: props, error } = await supabase
    .from('properties')
    .select(PROP_COLS_WITH_COORDS)
    .order('created_at', { ascending: false });

  if (error || !props) return [];

  const propertyIds = props.map((p: any) => p.id);
  const { data: allUnits } = await supabase
    .from('units')
    .select('*')
    .in('property_id', propertyIds);

  const unitsByProperty = new Map<string, any[]>();
  for (const u of allUnits || []) {
    const list = unitsByProperty.get(u.property_id) || [];
    list.push(u);
    unitsByProperty.set(u.property_id, list);
  }

  const userPoint: GeoPoint = { latitude: userLat, longitude: userLng };

  const results: (Property & { distance: number })[] = [];

  for (const p of props) {
    const row = p as any;
    let lat: number | null = null;
    let lng: number | null = null;

    if (row.latitude != null && row.longitude != null) {
      lat = row.latitude;
      lng = row.longitude;
    } else {
      const geo = geocodeLocation(p.location);
      if (geo) {
        lat = geo.latitude;
        lng = geo.longitude;
      }
    }

    if (lat === null || lng === null) continue;

    const dist = haversineDistance(userPoint, { latitude: lat, longitude: lng });
    if (dist > radiusKm) continue;

    const propertyUnits = unitsByProperty.get(p.id) || [];
    const totalUnits = propertyUnits.length || p.units;
    const occupiedUnits = propertyUnits.filter((u) => u.status === 'occupied').length;
    const monthlyRevenue = propertyUnits
      .filter((u) => u.status === 'occupied')
      .reduce((s, u) => s + Number(u.monthly_rent), 0);
    const vacantUnits = totalUnits - occupiedUnits;

    results.push({
      id: p.id, name: p.name, location: p.location, description: p.description, type: p.type, units: totalUnits,
      occupiedUnits, monthlyRevenue, status: p.status,
      image: p.image, images: Array.isArray(p.images) ? p.images : [], landlordId: p.landlord_id,
      latitude: lat, longitude: lng,
      distance: dist,
      paymentInfo: (typeof p.payment_info === 'string' ? JSON.parse(p.payment_info) : p.payment_info) as PaymentInfo | undefined,
      createdAt: p.created_at,
    });
  }

  results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, limit);
}

export async function fetchNearbyPropertiesByLocation(
  locationText: string,
  radiusKm: number = 15,
  limit: number = 10,
): Promise<Property[]> {
  const geo = geocodeLocation(locationText);
  if (!geo) return [];
  return fetchNearbyProperties(geo.latitude, geo.longitude, radiusKm, limit);
}

export async function createProperty(data: {
  name: string; location: string; description: string; units: number; type?: string;
  landlord_id: string; payment_info: PaymentInfo; images?: string[];
  latitude?: number; longitude?: number;
}): Promise<{ error?: string; id?: string }> {
  if (!data.name.trim()) return { error: 'Property name is required' };
  if (!data.location.trim()) return { error: 'Location is required' };
  if (!data.units || data.units <= 0) return { error: 'Number of units must be greater than 0' };
  if (!data.payment_info.rentAmount || data.payment_info.rentAmount <= 0) return { error: 'Monthly rent per unit is required' };
  if (!data.payment_info.depositAmount || data.payment_info.depositAmount <= 0) return { error: 'Security deposit amount is required' };

  const propId = crypto.randomUUID();
  const images = data.images || [];
  const insertData: Record<string, any> = {
    id: propId,
    name: data.name,
    location: data.location,
    description: data.description,
    units: data.units,
    type: data.type || 'Apartments',
    status: 'vacant',
    landlord_id: data.landlord_id,
    image: images[0] || '',
    images: images,
    payment_info: data.payment_info,
    created_at: new Date().toISOString(),
  };
  if (data.latitude !== undefined) insertData.latitude = data.latitude;
  if (data.longitude !== undefined) insertData.longitude = data.longitude;

  const { error } = await supabase.from('properties').insert(insertData);

  if (error) return { error: error.message };

  const prefix = data.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase() || 'U';
  const unitRecords = Array.from({ length: data.units }, (_, i) => ({
    property_id: propId,
    unit_number: `${prefix}-${String(i + 1).padStart(3, '0')}`,
    type: data.type || '1 Bedroom',
    monthly_rent: data.payment_info.rentAmount,
    status: 'vacant' as const,
    tenant_id: null as string | null,
  }));

  await supabase.from('units').insert(unitRecords);

  return { id: propId };
}

export async function updateProperty(id: string, data: {
  name?: string;
  location?: string;
  description?: string;
  type?: string;
  image?: string;
  images?: string[];
  payment_info?: PaymentInfo;
  latitude?: number;
  longitude?: number;
}): Promise<{ error?: string }> {
  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.location !== undefined) updates.location = data.location;
  if (data.description !== undefined) updates.description = data.description;
  if (data.type !== undefined) updates.type = data.type;
  if (data.image !== undefined) updates.image = data.image;
  if (data.images !== undefined) updates.images = data.images;
  if (data.payment_info !== undefined) updates.payment_info = data.payment_info;
  if (data.latitude !== undefined) updates.latitude = data.latitude;
  if (data.longitude !== undefined) updates.longitude = data.longitude;

  if (Object.keys(updates).length === 0) return {};

  let { error } = await supabase.from('properties').update(updates).eq('id', id);

  if (error && updates.images !== undefined) {
    delete updates.images;
    const result = await supabase.from('properties').update(updates).eq('id', id);
    error = result.error;
  }

  if (error) return { error: error.message };
  return {};
}

let storageReady = false;

async function ensureStorageReady(): Promise<void> {
  if (storageReady) return;
  const { error } = await supabase.rpc('setup_storage');
  if (error) {
    console.error('Storage setup RPC failed:', error.message);
  } else {
    storageReady = true;
  }
}

export async function uploadPropertyImage(propertyId: string, file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${propertyId}/${Date.now()}.${ext}`;

  await ensureStorageReady();

  let { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    const msg = uploadError.message || String(uploadError);

    if (msg.includes('Bucket not found') || msg.includes('not found')) {
      const { error: createErr } = await supabase.storage.createBucket('property-images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      });
      if (createErr) {
        return { error: `Storage bucket "property-images" not found. Please run setup_storage.sql in your Supabase SQL Editor. Error: ${createErr.message}` };
      }
      storageReady = false;
      await ensureStorageReady();
      const { error: retryErr } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, { contentType: file.type, upsert: false });
      if (retryErr) {
        return { error: `Upload failed after creating bucket: ${retryErr.message}` };
      }
      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(filePath);
      return { url: urlData.publicUrl };
    }

    if (msg.includes('row-level security') || msg.includes('RLS')) {
      storageReady = false;
      await ensureStorageReady();
      const { error: retryErr } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, { contentType: file.type, upsert: false });
      if (!retryErr) {
        const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(filePath);
        return { url: urlData.publicUrl };
      }
      return { error: `RLS policy blocked upload. Please run setup_storage.sql in your Supabase SQL Editor. Error: ${retryErr.message}` };
    }

    return { error: msg };
  }

  const { data: urlData } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl };
}

export async function uploadAvatar(userId: string, file: File): Promise<{ url?: string; error?: string }> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl };
}

// ─── Tenants ─────────────────────────────────────────────
export async function fetchTenants(landlordId?: string): Promise<Tenant[]> {
  const { data: tenantProfiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'tenant')
    .eq('is_active', true);

  if (error || !tenantProfiles) return [];

  const tenantIds = tenantProfiles.map((t) => t.id);
  if (tenantIds.length === 0) return [];

  const [{ data: allUnits }, { data: allProperties }, { data: allPayments }] = await Promise.all([
    supabase.from('units').select('*').in('tenant_id', tenantIds),
    supabase.from('properties').select('id, name, landlord_id'),
    supabase.from('payments').select('*').in('tenant_id', tenantIds).order('due_date', { ascending: false }),
  ]);

  const units = allUnits || [];
  const properties = allProperties || [];
  const payments = allPayments || [];

  return tenantProfiles.map((t) => {
    const unit = units.find((u) => u.tenant_id === t.id);
    const prop = unit ? properties.find((p) => p.id === unit.property_id) : undefined;
    const tenantPayments = payments.filter((p) => p.tenant_id === t.id);
    const sorted = tenantPayments.sort((a, b) => b.due_date.localeCompare(a.due_date));
    const paymentStatus = sorted.length > 0 ? sorted[0].status : 'pending';
    return {
      id: t.id, name: t.name, email: t.email || '', phone: t.phone || '',
      nationalId: t.national_id || '', avatar: t.avatar || '',
      unitId: unit?.id || '',
      propertyId: unit?.property_id || '', propertyName: prop?.name || '',
      unitNumber: unit?.unit_number || '', rentAmount: Number(unit?.monthly_rent || 0),
      status: paymentStatus, leaseStart: '', leaseEnd: '',
      emergencyContact: t.emergency_contact || '',
    };
  }).filter((t) => {
    if (!landlordId) return true;
    const prop = properties.find((p) => p.id === t.propertyId);
    return prop && prop.landlord_id === landlordId;
  });
}

export async function fetchTenantById(id: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) return null;

  if (isDemoAccount(id)) {
    await seedDemoDataForTenant(id, profile.name || 'Tenant');
  }

  const [{ data: unit }, { data: tenantPayments }, { data: tenantMaintenance }, { data: activeLease }] = await Promise.all([
    supabase.from('units').select('*').eq('tenant_id', id).maybeSingle(),
    supabase.from('payments').select('*').eq('tenant_id', id).order('due_date', { ascending: false }),
    supabase.from('maintenance_requests').select('*').eq('tenant_id', id).order('created_at', { ascending: false }),
    supabase.from('leases').select('*').eq('tenant_id', id).eq('status', 'active').maybeSingle(),
  ]);

  let propName = '';
  if (unit) {
    const { data } = await supabase.from('properties').select('name').eq('id', unit.property_id).single();
    propName = data?.name || '';
  }

  return {
    ...profile,
    unitNumber: unit?.unit_number || '',
    propertyName: propName,
    rentAmount: unit?.monthly_rent || 0,
    emergencyContact: profile.emergency_contact || '',
    payments: (tenantPayments || []).sort((a: any, b: any) => b.due_date.localeCompare(a.due_date)),
    maintenance: (tenantMaintenance || []).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')),
    lease: activeLease || null,
  };
}

export async function createTenant(data: {
  id: string; name: string; email: string; phone: string; nationalId: string;
  propertyId: string; unitNumber: string; rentAmount: number;
  leaseStart: string; leaseEnd: string; emergencyContact: string;
}): Promise<{ error?: string }> {
  if (!data.name.trim()) return { error: 'Name is required' };
  if (!validateEmail(data.email)) return { error: 'Invalid email address' };
  if (!data.propertyId) return { error: 'Property is required' };
  if (!data.unitNumber.trim()) return { error: 'Unit number is required' };
  if (!data.rentAmount || data.rentAmount <= 0) return { error: 'Rent amount must be greater than 0' };
  if (data.leaseStart && data.leaseEnd && data.leaseEnd < data.leaseStart) {
    return { error: 'Lease end date must be after start date' };
  }

  const { data: occupiedUnit } = await supabase
    .from('units')
    .select('id')
    .eq('property_id', data.propertyId)
    .eq('unit_number', data.unitNumber)
    .not('tenant_id', 'is', null)
    .single();

  if (occupiedUnit) return { error: 'This unit is already occupied' };

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    national_id: data.nationalId,
    avatar: '',
    role: 'tenant',
    subscription: 'free',
    emergency_contact: data.emergencyContact,
    is_verified: true,
    is_active: true,
    created_at: new Date().toISOString(),
  });

  if (profileError) return { error: profileError.message };

  const { data: existingUnit } = await supabase
    .from('units')
    .select('id')
    .eq('property_id', data.propertyId)
    .eq('unit_number', data.unitNumber)
    .single();

  let unitId: string;
  if (existingUnit) {
    await supabase
      .from('units')
      .update({ tenant_id: data.id, status: 'occupied' })
      .eq('id', existingUnit.id);
    unitId = existingUnit.id;
  } else {
    const { data: newUnit, error: unitError } = await supabase
      .from('units')
      .insert({
        property_id: data.propertyId,
        unit_number: data.unitNumber,
        type: '1 Bedroom',
        monthly_rent: data.rentAmount,
        status: 'occupied',
        tenant_id: data.id,
      })
      .select('id')
      .single();

    if (unitError) return { error: unitError.message };
    unitId = newUnit!.id;
  }

  if (data.leaseStart && data.leaseEnd) {
    await supabase.from('leases').insert({
      tenant_id: data.id,
      property_id: data.propertyId,
      unit_id: unitId,
      start_date: data.leaseStart,
      end_date: data.leaseEnd,
      rent_amount: data.rentAmount,
      deposit_amount: data.rentAmount,
      terms: 'Standard lease terms apply.',
      status: 'active',
      signed_by_tenant: true,
      signed_by_landlord: true,
    });
  }

  return {};
}

// ─── Payments ────────────────────────────────────────────
export async function fetchPayments(): Promise<Payment[]> {
  const { data: payRows, error } = await supabase
    .from('payments')
    .select('*')
    .order('due_date', { ascending: false });

  if (error || !payRows) return [];

  const tenantIds = [...new Set(payRows.map((p) => p.tenant_id))];
  const unitIds = [...new Set(payRows.filter((p) => p.unit_id).map((p) => p.unit_id))];

  const [{ data: profiles }, { data: units }] = await Promise.all([
    tenantIds.length > 0
      ? supabase.from('profiles').select('id, name').in('id', tenantIds)
      : { data: [] as any[], error: null },
    unitIds.length > 0
      ? supabase.from('units').select('id, unit_number').in('id', unitIds)
      : { data: [] as any[], error: null },
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]));
  const unitMap = new Map((units || []).map((u) => [u.id, u.unit_number]));

  return payRows.map((p) => ({
    id: p.id, tenantId: p.tenant_id,
    tenantName: profileMap.get(p.tenant_id) || '',
    amount: Number(p.amount), date: p.due_date,
    status: p.status,
    method: (p.method || 'mpesa'),
    transactionId: p.transaction_id ?? undefined,
    receiptId: p.receipt_id ?? undefined,
    unitNumber: p.unit_id ? (unitMap.get(p.unit_id) || '') : '',
  }));
}

// ─── Maintenance ─────────────────────────────────────────
export async function fetchMaintenance(): Promise<MaintenanceRequest[]> {
  const { data: maintRows, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !maintRows) return [];

  const tenantIds = [...new Set(maintRows.map((m) => m.tenant_id))];
  const propertyIds = [...new Set(maintRows.map((m) => m.property_id))];
  const unitIds = [...new Set(maintRows.filter((m) => m.unit_id).map((m) => m.unit_id))];

  const [{ data: profiles }, { data: properties }, { data: units }] = await Promise.all([
    tenantIds.length > 0
      ? supabase.from('profiles').select('id, name').in('id', tenantIds)
      : { data: [] as any[], error: null },
    propertyIds.length > 0
      ? supabase.from('properties').select('id, name').in('id', propertyIds)
      : { data: [] as any[], error: null },
    unitIds.length > 0
      ? supabase.from('units').select('id, unit_number').in('id', unitIds)
      : { data: [] as any[], error: null },
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]));
  const propertyMap = new Map((properties || []).map((p) => [p.id, p.name]));
  const unitMap = new Map((units || []).map((u) => [u.id, u.unit_number]));

  return maintRows.map((m) => ({
    id: m.id, tenantId: m.tenant_id,
    tenantName: profileMap.get(m.tenant_id) || '',
    propertyId: m.property_id, propertyName: propertyMap.get(m.property_id) || '',
    unitNumber: m.unit_id ? (unitMap.get(m.unit_id) || '') : '',
    category: m.category, description: m.description, priority: m.priority,
    status: m.status, assignedTo: m.assigned_to,
    images: Array.isArray(m.images) ? m.images : [],
    createdAt: m.created_at, completedAt: m.completed_at, progress: m.progress,
    cost: m.cost ? Number(m.cost) : undefined,
  }));
}

export async function fetchMaintenanceById(id: string) {
  const { data: m, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !m) return null;

  const [{ data: profile }, { data: property }, { data: unit }] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', m.tenant_id).single(),
    supabase.from('properties').select('name').eq('id', m.property_id).single(),
    m.unit_id
      ? supabase.from('units').select('unit_number').eq('id', m.unit_id).single()
      : { data: null, error: null },
  ]);

  return {
    id: m.id, tenantId: m.tenant_id,
    tenantName: profile?.name || '',
    propertyId: m.property_id, propertyName: property?.name || '',
    unitNumber: unit?.unit_number || '',
    category: m.category, description: m.description, priority: m.priority,
    status: m.status, assignedTo: m.assigned_to,
    images: Array.isArray(m.images) ? m.images : [],
    createdAt: m.created_at, completedAt: m.completed_at, progress: m.progress,
    cost: m.cost ? Number(m.cost) : undefined,
  };
}

export async function createMaintenanceRequest(data: {
  id: string; tenant_id: string; property_id: string; unit_id: string;
  category: string; description: string; priority: string;
}): Promise<void> {
  await supabase.from('maintenance_requests').insert({
    id: data.id,
    tenant_id: data.tenant_id,
    unit_id: data.unit_id || null,
    property_id: data.property_id,
    category: data.category,
    description: data.description,
    priority: data.priority,
    status: 'submitted',
    images: [],
    progress: 0,
    created_at: new Date().toISOString(),
  });
}

export async function updateMaintenanceRequest(id: string, updates: Record<string, any>): Promise<void> {
  await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id);
}

// ─── Dashboard Stats ─────────────────────────────────────
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [propsRes, unitsRes, paymentsRes, profilesRes, maintenanceRes] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('units').select('status'),
    supabase.from('payments').select('amount, status'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tenant'),
    supabase.from('maintenance_requests').select('status'),
  ]);

  const units = unitsRes.data || [];
  const payRows = paymentsRes.data || [];
  const maintRows = maintenanceRes.data || [];

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = payRows
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payRows
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount), 0);
  const overdueAmount = payRows
    .filter((p) => p.status === 'overdue')
    .reduce((s, p) => s + Number(p.amount), 0);
  const activeMaintenance = maintRows.filter(
    (m) => m.status !== 'completed' && m.status !== 'cancelled'
  ).length;

  return {
    totalProperties: propsRes.count || 0,
    totalUnits, occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits, monthlyRevenue,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0,
    pendingPayments, overdueAmount, activeMaintenance,
    totalTenants: profilesRes.count || 0,
  };
}

// ─── Landlord Dashboard Data ─────────────────────────────
export async function fetchLandlordStats(landlordId: string): Promise<DashboardStats> {
  const { data: propIds } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', landlordId);

  if (!propIds || propIds.length === 0) {
    return {
      totalProperties: 0, totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
      monthlyRevenue: 0, occupancyRate: 0, pendingPayments: 0, overdueAmount: 0,
      activeMaintenance: 0, totalTenants: 0,
    };
  }

  const pIds = propIds.map((p) => p.id);

  const [{ data: units }, { data: landlordUnits }, { data: maintRows }] = await Promise.all([
    supabase.from('units').select('id, status, monthly_rent').in('property_id', pIds),
    supabase.from('units').select('id').in('property_id', pIds),
    supabase.from('maintenance_requests').select('status').in('property_id', pIds),
  ]);

  const unitIds = (landlordUnits || []).map((u: any) => u.id);

  let payRows: any[] = [];
  if (unitIds.length > 0) {
    const { data } = await supabase
      .from('payments')
      .select('amount, status')
      .in('unit_id', unitIds);
    payRows = data || [];
  }

  const unitList = units || [];
  const maintList = maintRows || [];
  const totalUnits = unitList.length;
  const occupiedUnits = unitList.filter((u: any) => u.status === 'occupied').length;
  const monthlyRevenue = unitList
    .filter((u: any) => u.status === 'occupied')
    .reduce((s: number, u: any) => s + Number(u.monthly_rent), 0);
  const pendingPayments = payRows
    .filter((p: any) => p.status === 'pending')
    .reduce((s: number, p: any) => s + Number(p.amount), 0);
  const overdueAmount = payRows
    .filter((p: any) => p.status === 'overdue')
    .reduce((s: number, p: any) => s + Number(p.amount), 0);
  const activeMaintenance = maintList.filter(
    (m: any) => m.status !== 'completed' && m.status !== 'cancelled'
  ).length;

  const tenantIds = unitList.filter((u: any) => u.tenant_id).map((u: any) => u.tenant_id);
  const uniqueTenants = new Set(tenantIds);

  return {
    totalProperties: pIds.length,
    totalUnits, occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits, monthlyRevenue,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0,
    pendingPayments, overdueAmount, activeMaintenance,
    totalTenants: uniqueTenants.size,
  };
}

export async function fetchLandlordProperties(landlordId: string) {
  const { data: props } = await supabase
    .from('properties')
    .select(PROP_COLS)
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (!props || props.length === 0) return [];

  const propertyIds = props.map((p) => p.id);
  const { data: allUnits } = await supabase
    .from('units')
    .select('*')
    .in('property_id', propertyIds);

  const unitsByProperty = new Map<string, any[]>();
  for (const u of allUnits || []) {
    const list = unitsByProperty.get(u.property_id) || [];
    list.push(u);
    unitsByProperty.set(u.property_id, list);
  }

  return props.map((p) => {
    const propertyUnits = unitsByProperty.get(p.id) || [];
    const totalUnits = propertyUnits.length || p.units;
    const occupiedUnits = propertyUnits.filter((u) => u.status === 'occupied').length;
    const monthlyRevenue = propertyUnits
      .filter((u) => u.status === 'occupied')
      .reduce((s, u) => s + Number(u.monthly_rent), 0);
    return {
      id: p.id, name: p.name, location: p.location, description: p.description, type: p.type, units: totalUnits,
      occupiedUnits, monthlyRevenue, status: p.status,
      image: p.image, images: Array.isArray(p.images) ? p.images : [], landlordId: p.landlord_id,
      paymentInfo: (typeof p.payment_info === 'string' ? JSON.parse(p.payment_info) : p.payment_info) as PaymentInfo | undefined,
      createdAt: p.created_at,
    };
  });
}

export async function fetchLandlordMaintenance(landlordId: string): Promise<MaintenanceRequest[]> {
  const { data: propIds } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', landlordId);

  if (!propIds || propIds.length === 0) return [];

  const pIds = propIds.map((p) => p.id);
  const { data: maintRows, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .in('property_id', pIds)
    .order('created_at', { ascending: false });

  if (error || !maintRows) return [];

  const tenantIds = [...new Set(maintRows.map((m) => m.tenant_id))];
  const unitIds = [...new Set(maintRows.filter((m) => m.unit_id).map((m) => m.unit_id))];

  const [{ data: profiles }, { data: properties }, { data: units }] = await Promise.all([
    tenantIds.length > 0
      ? supabase.from('profiles').select('id, name').in('id', tenantIds)
      : { data: [] as any[], error: null },
    supabase.from('properties').select('id, name').in('id', pIds),
    unitIds.length > 0
      ? supabase.from('units').select('id, unit_number').in('id', unitIds)
      : { data: [] as any[], error: null },
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]));
  const propertyMap = new Map((properties || []).map((p) => [p.id, p.name]));
  const unitMap = new Map((units || []).map((u) => [u.id, u.unit_number]));

  return maintRows.map((m) => ({
    id: m.id, tenantId: m.tenant_id,
    tenantName: profileMap.get(m.tenant_id) || '',
    propertyId: m.property_id, propertyName: propertyMap.get(m.property_id) || '',
    unitNumber: m.unit_id ? (unitMap.get(m.unit_id) || '') : '',
    category: m.category, description: m.description, priority: m.priority,
    status: m.status, assignedTo: m.assigned_to,
    images: Array.isArray(m.images) ? m.images : [],
    createdAt: m.created_at, completedAt: m.completed_at, progress: m.progress,
    cost: m.cost ? Number(m.cost) : undefined,
  }));
}

export async function fetchLandlordPayments(landlordId: string) {
  const { data: propIds } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', landlordId);

  if (!propIds || propIds.length === 0) return [];

  const pIds = propIds.map((p) => p.id);
  const { data: landlordUnits } = await supabase
    .from('units')
    .select('id, unit_number')
    .in('property_id', pIds);

  const unitIds = (landlordUnits || []).map((u) => u.id);
  if (unitIds.length === 0) return [];

  const { data: payRows } = await supabase
    .from('payments')
    .select('*')
    .in('unit_id', unitIds)
    .order('due_date', { ascending: false });

  if (!payRows) return [];

  const tenantIds = [...new Set(payRows.map((p) => p.tenant_id))];
  const { data: profiles } = tenantIds.length > 0
    ? await supabase.from('profiles').select('id, name').in('id', tenantIds)
    : { data: [] as any[] };

  const unitLookup = new Map((landlordUnits || []).map((u) => [u.id, u.unit_number]));
  const profileMap = new Map((profiles || []).map((p) => [p.id, p.name]));

  return payRows.map((p) => ({
    id: p.id, tenantId: p.tenant_id,
    tenantName: profileMap.get(p.tenant_id) || '',
    amount: Number(p.amount), date: p.due_date,
    status: p.status,
    method: (p.method || 'mpesa') as 'mpesa' | 'bank' | 'cash',
    transactionId: p.transaction_id ?? undefined,
    receiptId: p.receipt_id ?? undefined,
    unitNumber: unitLookup.get(p.unit_id) || '',
  }));
}

// ─── Revenue Data ────────────────────────────────────────
export async function fetchRevenueData(): Promise<RevenueData[]> {
  const { data: paid } = await supabase
    .from('payments')
    .select('amount, paid_date')
    .eq('status', 'paid')
    .not('paid_date', 'is', null)
    .order('paid_date', { ascending: true });

  if (!paid) return [];

  const months: Record<string, number> = {};
  for (const p of paid) {
    const d = new Date(p.paid_date);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' }).toUpperCase().replace(' ', "'");
    months[key] = (months[key] || 0) + Number(p.amount);
  }
  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

export async function fetchLandlordRevenueData(landlordId: string): Promise<RevenueData[]> {
  const { data: propIds } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', landlordId);

  if (!propIds || propIds.length === 0) return [];

  const pIds = propIds.map((p) => p.id);
  const { data: landlordUnits } = await supabase
    .from('units')
    .select('id')
    .in('property_id', pIds);

  const unitIds = (landlordUnits || []).map((u) => u.id);
  if (unitIds.length === 0) return [];

  const { data: paid } = await supabase
    .from('payments')
    .select('amount, paid_date')
    .eq('status', 'paid')
    .not('paid_date', 'is', null)
    .in('unit_id', unitIds)
    .order('paid_date', { ascending: true });

  if (!paid) return [];

  const months: Record<string, number> = {};
  for (const p of paid) {
    const d = new Date(p.paid_date);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' }).toUpperCase().replace(' ', "'");
    months[key] = (months[key] || 0) + Number(p.amount);
  }
  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

// ─── Units ───────────────────────────────────────────────
export async function fetchUnitsByProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', propertyId)
    .order('unit_number', { ascending: true });

  if (error || !data) return [];
  return data;
}

// ─── Leases ──────────────────────────────────────────────
export async function fetchLeases() {
  const { data: leaseRows, error } = await supabase
    .from('leases')
    .select('*');

  if (error || !leaseRows) return [];

  const propertyIds = [...new Set(leaseRows.map((l) => l.property_id))];
  const unitIds = [...new Set(leaseRows.filter((l) => l.unit_id).map((l) => l.unit_id))];

  const [{ data: properties }, { data: units }] = await Promise.all([
    propertyIds.length > 0
      ? supabase.from('properties').select('id, name').in('id', propertyIds)
      : { data: [] as any[], error: null },
    unitIds.length > 0
      ? supabase.from('units').select('id, unit_number').in('id', unitIds)
      : { data: [] as any[], error: null },
  ]);

  const propertyMap = new Map((properties || []).map((p) => [p.id, p.name]));
  const unitMap = new Map((units || []).map((u) => [u.id, u.unit_number]));

  return leaseRows.map((l) => ({
    ...l,
    properties: { name: propertyMap.get(l.property_id) || '' },
    units: { unit_number: l.unit_id ? (unitMap.get(l.unit_id) || '') : '' },
  }));
}

// ─── Property detail (joined data for [id] page) ────────
export async function fetchPropertyDetailData(id: string) {
  let prop: any = null;
  let error: any = null;

  const first = await supabase
    .from('properties')
    .select(PROP_COLS)
    .eq('id', id)
    .single();

  if (first.error || !first.data) {
    const retry = await supabase
      .from('properties')
      .select(PROP_COLS_SAFE)
      .eq('id', id)
      .single();
    prop = retry.data;
    error = retry.error;
  } else {
    prop = first.data;
    error = first.error;
  }

  if (error || !prop) return null;

  const { data: propertyUnits } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', id);

  const units = propertyUnits || [];
  const tenantIds = units.filter((u) => u.tenant_id).map((u) => u.tenant_id as string);

  let tenantProfiles: any[] = [];
  let allPayments: any[] = [];

  if (tenantIds.length > 0) {
    const [tp, pp] = await Promise.all([
      supabase.from('profiles').select('*').in('id', tenantIds),
      supabase.from('payments').select('*').in('tenant_id', tenantIds).order('due_date', { ascending: false }),
    ]);
    tenantProfiles = tp.data || [];
    allPayments = pp.data || [];
  }

  const totalUnits = units.length || prop.units;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = units
    .filter((u) => u.status === 'occupied')
    .reduce((s, u) => s + Number(u.monthly_rent), 0);

  return {
    property: {
      id: prop.id, name: prop.name, location: prop.location, description: prop.description, type: prop.type,
      units: totalUnits, occupiedUnits, monthlyRevenue,
      status: prop.status, landlordId: prop.landlord_id,
      image: prop.image, images: Array.isArray((prop as any).images) ? (prop as any).images : [],
      paymentInfo: (typeof prop.payment_info === 'string' ? JSON.parse(prop.payment_info) : prop.payment_info) as PaymentInfo | undefined,
      createdAt: prop.created_at,
    },
    tenants: tenantProfiles.map((p) => {
      const unit = units.find((u) => u.tenant_id === p.id);
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
  const { data: l, error } = await supabase
    .from('leases')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !l) return null;

  const [{ data: tenant }, { data: prop }, { data: unit }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', l.tenant_id).single(),
    supabase.from('properties').select('name, location').eq('id', l.property_id).single(),
    l.unit_id
      ? supabase.from('units').select('unit_number, type').eq('id', l.unit_id).single()
      : { data: null, error: null },
  ]);

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
export async function fetchTenantDashboardData(userId: string, tenantName?: string) {
  if (isDemoAccount(userId)) {
    await seedDemoDataForTenant(userId, tenantName || 'Tenant');
  }

  const [{ data: unit }, { data: lease }, { data: maint }] = await Promise.all([
    supabase.from('units').select('*').eq('tenant_id', userId).maybeSingle(),
    supabase.from('leases').select('*').eq('tenant_id', userId).eq('status', 'active').maybeSingle(),
    supabase.from('maintenance_requests').select('*').eq('tenant_id', userId).neq('status', 'completed').order('created_at', { ascending: false }).limit(2),
  ]);

  let prop = null;
  if (unit) {
    const { data } = await supabase.from('properties').select(PROP_COLS).eq('id', unit.property_id).single();
    prop = data;
  }

  return { unit: unit || null, property: prop || null, lease: lease || null, maintenance: maint || [] };
}

// ─── Delete Property ───────────────────────────────────
export async function deleteProperty(id: string): Promise<{ error?: string }> {
  const { data: prop, error: fetchError } = await supabase
    .from('properties')
    .select('name')
    .eq('id', id)
    .single();

  if (fetchError || !prop) return { error: 'Property not found' };

  const { data: propertyUnits } = await supabase
    .from('units')
    .select('id')
    .eq('property_id', id)
    .not('tenant_id', 'is', null);

  if (propertyUnits && propertyUnits.length > 0) {
    return { error: `Cannot delete "${prop.name}" — it has ${propertyUnits.length} active tenant(s). Please remove or transfer them first.` };
  }

  await supabase.from('maintenance_requests').delete().eq('property_id', id);
  await supabase.from('leases').delete().eq('property_id', id);
  await supabase.from('units').delete().eq('property_id', id);
  await supabase.from('properties').delete().eq('id', id);

  return {};
}

// ─── Deactivate Tenant (Soft Delete) ──────────────────
export async function deactivateTenant(id: string): Promise<{ error?: string }> {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (fetchError || !profile) return { error: 'Tenant not found' };
  if (profile.role !== 'tenant') return { error: 'Can only deactivate tenant accounts' };

  await supabase.from('profiles').update({ is_active: false }).eq('id', id);

  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', id)
    .single();

  if (unit) {
    await supabase.from('units').update({ tenant_id: null, status: 'vacant' }).eq('id', unit.id);
  }

  const { data: activeLease } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', id)
    .eq('status', 'active')
    .single();

  if (activeLease) {
    await supabase.from('leases').update({ status: 'terminated' }).eq('id', activeLease.id);
  }

  return {};
}

// ─── Tenant Payments (for tenant portal) ──────────────
export async function fetchTenantPayments(tenantId: string): Promise<Payment[]> {
  const { data: payRows, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('due_date', { ascending: false });

  if (error || !payRows) return [];

  const unitIds = [...new Set(payRows.filter((p) => p.unit_id).map((p) => p.unit_id))];
  const { data: units } = unitIds.length > 0
    ? await supabase.from('units').select('id, unit_number').in('id', unitIds)
    : { data: [] as any[] };

  const unitMap = new Map((units || []).map((u) => [u.id, u.unit_number]));

  const [{ data: profile }, unitResult] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', tenantId).single(),
    { data: units },
  ]);

  const tenantName = profile?.name || '';

  return payRows.map((p) => ({
    id: p.id, tenantId: p.tenant_id,
    tenantName,
    amount: Number(p.amount), date: p.due_date,
    status: p.status,
    method: (p.method || 'mpesa') as 'mpesa' | 'bank' | 'cash',
    transactionId: p.transaction_id ?? undefined,
    receiptId: p.receipt_id ?? undefined,
    unitNumber: p.unit_id ? (unitMap.get(p.unit_id) || '') : '',
  }));
}

// ─── Tenant Maintenance Requests (for tenant portal) ──
export async function fetchTenantMaintenanceRequests(tenantId: string): Promise<MaintenanceRequest[]> {
  const { data: maintRows, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error || !maintRows) return [];

  const propertyIds = [...new Set(maintRows.map((m) => m.property_id))];
  const unitIds = [...new Set(maintRows.filter((m) => m.unit_id).map((m) => m.unit_id))];

  const [{ data: properties }, { data: units }] = await Promise.all([
    propertyIds.length > 0
      ? supabase.from('properties').select('id, name').in('id', propertyIds)
      : { data: [] as any[], error: null },
    unitIds.length > 0
      ? supabase.from('units').select('id, unit_number').in('id', unitIds)
      : { data: [] as any[], error: null },
  ]);

  const propertyMap = new Map((properties || []).map((p) => [p.id, p.name]));
  const unitMap = new Map((units || []).map((u) => [u.id, u.unit_number]));

  return maintRows.map((m) => ({
    id: m.id, tenantId: m.tenant_id,
    tenantName: '',
    propertyId: m.property_id, propertyName: propertyMap.get(m.property_id) || '',
    unitNumber: m.unit_id ? (unitMap.get(m.unit_id) || '') : '',
    category: m.category, description: m.description, priority: m.priority,
    status: m.status, assignedTo: m.assigned_to,
    images: Array.isArray(m.images) ? m.images : [],
    createdAt: m.created_at, completedAt: m.completed_at, progress: m.progress,
    cost: m.cost ? Number(m.cost) : undefined,
  }));
}

// ─── Permanently Delete Tenant ─────────────────────────
export async function deleteTenant(id: string): Promise<{ error?: string }> {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (fetchError || !profile) return { error: 'Tenant not found' };
  if (profile.role !== 'tenant') return { error: 'Can only delete tenant accounts' };

  const { data: unit } = await supabase
    .from('units')
    .select('id')
    .eq('tenant_id', id)
    .single();

  if (unit) {
    await supabase.from('units').update({ tenant_id: null, status: 'vacant' }).eq('id', unit.id);
  }

  await supabase.from('leases').delete().eq('tenant_id', id);
  await supabase.from('profiles').delete().eq('id', id);

  return {};
}
