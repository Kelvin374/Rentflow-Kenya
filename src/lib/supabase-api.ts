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

  if (data.payment_info?.rentAmount && data.payment_info.rentAmount > 0) {
    await supabase
      .from('units')
      .update({ monthly_rent: data.payment_info.rentAmount })
      .eq('property_id', id);
  }

  if (data.type !== undefined) {
    await supabase
      .from('units')
      .update({ type: data.type })
      .eq('property_id', id);
  }

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
  if (landlordId) {
    const { data: propIds } = await supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', landlordId);

    if (!propIds || propIds.length === 0) return [];

    const pIds = propIds.map((p) => p.id);

    const [{ data: landlordUnits }, { data: allProperties }] = await Promise.all([
      supabase.from('units').select('*').in('property_id', pIds).not('tenant_id', 'is', null),
      supabase.from('properties').select('id, name, landlord_id').in('id', pIds),
    ]);

    const units = landlordUnits || [];
    const properties = allProperties || [];
    const tenantIds = [...new Set(units.map((u: any) => u.tenant_id).filter(Boolean))];
    const validUnitIds = units.map((u: any) => u.id);

    if (tenantIds.length === 0) return [];

    const [{ data: tenantProfiles }, { data: allPayments }] = await Promise.all([
      supabase.from('profiles').select('*').in('id', tenantIds),
      validUnitIds.length > 0
        ? supabase.from('payments').select('*').in('unit_id', validUnitIds).order('due_date', { ascending: false })
        : { data: [] as any[] },
    ]);

    const profiles = tenantProfiles || [];
    const payments = allPayments || [];

    return units.map((unit: any) => {
      const profile = profiles.find((p: any) => p.id === unit.tenant_id)!;
      const prop = properties.find((p: any) => p.id === unit.property_id);
      const unitPayments = payments.filter((p: any) => p.unit_id === unit.id);
      const sorted = unitPayments.sort((a: any, b: any) => b.due_date.localeCompare(a.due_date));
      const latest = sorted[0];
      let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
      if (latest) {
        if (latest.status === 'approved' || latest.status === 'paid') paymentStatus = 'paid';
        else if (latest.status === 'overdue') paymentStatus = 'overdue';
        else paymentStatus = 'pending';
      }
      return {
        id: profile.id, name: profile.name, email: profile.email || '', phone: profile.phone || '',
        nationalId: profile.national_id || '', avatar: profile.avatar || '',
        unitId: unit.id,
        propertyId: unit.property_id || '', propertyName: prop?.name || '',
        unitNumber: unit.unit_number || '', rentAmount: Number(unit.monthly_rent || 0),
        status: paymentStatus, leaseStart: '', leaseEnd: '',
        emergencyContact: profile.emergency_contact || '',
      };
    });
  }

  const { data: allOccupiedUnits, error: unitsError } = await supabase
    .from('units')
    .select('*')
    .not('tenant_id', 'is', null);

  if (unitsError || !allOccupiedUnits) return [];

  const units = allOccupiedUnits;
  const tenantIds = [...new Set(units.map((u: any) => u.tenant_id).filter(Boolean))];
  const validUnitIds = units.map((u: any) => u.id);

  if (tenantIds.length === 0) return [];

  const [{ data: tenantProfiles }, { data: allProperties }, { data: allPayments }] = await Promise.all([
    supabase.from('profiles').select('*').in('id', tenantIds).eq('is_active', true),
    supabase.from('properties').select('id, name, landlord_id'),
    validUnitIds.length > 0
      ? supabase.from('payments').select('*').in('unit_id', validUnitIds).order('due_date', { ascending: false })
      : { data: [] as any[] },
  ]);

  const profiles = tenantProfiles || [];
  const properties = allProperties || [];
  const payments = allPayments || [];

  const activeProfileIds = new Set(profiles.map((t: any) => t.id));

  return units.filter((u: any) => activeProfileIds.has(u.tenant_id)).map((unit: any) => {
    const profile = profiles.find((p: any) => p.id === unit.tenant_id)!;
    const prop = properties.find((p) => p.id === unit.property_id);
    const unitPayments = payments.filter((p: any) => p.unit_id === unit.id);
    const sorted = unitPayments.sort((a, b) => b.due_date.localeCompare(a.due_date));
    const latest = sorted[0];
    let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
    if (latest) {
      if (latest.status === 'approved' || latest.status === 'paid') paymentStatus = 'paid';
      else if (latest.status === 'overdue') paymentStatus = 'overdue';
      else paymentStatus = 'pending';
    }
    return {
      id: profile.id, name: profile.name, email: profile.email || '', phone: profile.phone || '',
      nationalId: profile.national_id || '', avatar: profile.avatar || '',
      unitId: unit.id,
      propertyId: unit.property_id || '', propertyName: prop?.name || '',
      unitNumber: unit.unit_number || '', rentAmount: Number(unit.monthly_rent || 0),
      status: paymentStatus, leaseStart: '', leaseEnd: '',
      emergencyContact: profile.emergency_contact || '',
    };
  });
}

export async function fetchTenantById(id: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) return null;

  const { data: allUnits } = await supabase.from('units').select('*').eq('tenant_id', id);

  const units = allUnits || [];

  const propertyIds = [...new Set(units.map((u) => u.property_id).filter(Boolean))];
  let propertyMap = new Map<string, string>();
  if (propertyIds.length > 0) {
    const { data: props } = await supabase.from('properties').select('id, name').in('id', propertyIds);
    (props || []).forEach((p: any) => propertyMap.set(p.id, p.name));
  }

  const validUnitIds = units.map((u) => u.id);
  let filteredPayments: any[] = [];
  let tenantMaintenance: any[] = [];
  let activeLeases: any[] = [];
  if (validUnitIds.length > 0) {
    const [paymentsRes, maintRes, leasesRes] = await Promise.all([
      supabase.from('payments').select('*').in('unit_id', validUnitIds).order('due_date', { ascending: false }),
      supabase.from('maintenance_requests').select('*').eq('tenant_id', id).order('created_at', { ascending: false }),
      supabase.from('leases').select('*').eq('tenant_id', id).eq('status', 'active'),
    ]);
    filteredPayments = paymentsRes.data || [];
    tenantMaintenance = maintRes.data || [];
    activeLeases = leasesRes.data || [];
  }

  const primaryUnit = units[0] || null;
  const primaryPropName = primaryUnit ? (propertyMap.get(primaryUnit.property_id) || '') : '';

  return {
    ...profile,
    unitNumber: primaryUnit?.unit_number || '',
    propertyName: primaryPropName,
    rentAmount: primaryUnit?.monthly_rent || 0,
    emergencyContact: profile.emergency_contact || '',
    units: units.map((u) => ({
      id: u.id, unitNumber: u.unit_number, propertyId: u.property_id,
      propertyName: propertyMap.get(u.property_id) || '',
      monthlyRent: Number(u.monthly_rent), status: u.status,
    })),
    payments: filteredPayments.sort((a: any, b: any) => b.due_date.localeCompare(a.due_date)),
    maintenance: tenantMaintenance.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || '')),
    lease: activeLeases?.[0] || null,
  };
}

export async function lookupProfileByEmail(email: string): Promise<{ id: string; name: string; phone: string; national_id: string } | null> {
  if (!email) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, name, phone, national_id')
    .eq('email', email)
    .maybeSingle();
  return data || null;
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
    .maybeSingle();

  if (occupiedUnit) return { error: 'This unit is already occupied' };

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .maybeSingle();

  let tenantId = data.id;

  if (existingProfile) {
    tenantId = existingProfile.id;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: data.name,
        phone: data.phone,
        national_id: data.nationalId,
        role: 'tenant',
        emergency_contact: data.emergencyContact,
        is_verified: true,
        is_active: true,
      })
      .eq('id', existingProfile.id);
    if (updateError) return { error: updateError.message };
  } else {
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
  }

  const { data: existingUnit } = await supabase
    .from('units')
    .select('id')
    .eq('property_id', data.propertyId)
    .eq('unit_number', data.unitNumber)
    .maybeSingle();

  let unitId: string;
  if (existingUnit) {
    const { error: unitUpdateError } = await supabase
      .from('units')
      .update({ tenant_id: tenantId, status: 'occupied' })
      .eq('id', existingUnit.id);
    if (unitUpdateError) return { error: unitUpdateError.message };
    unitId = existingUnit.id;
  } else {
    const { data: prop } = await supabase
      .from('properties')
      .select('type')
      .eq('id', data.propertyId)
      .maybeSingle();

    const { data: newUnit, error: unitError } = await supabase
      .from('units')
      .insert({
        property_id: data.propertyId,
        unit_number: data.unitNumber,
        type: prop?.type || '1 Bedroom',
        monthly_rent: data.rentAmount,
        status: 'occupied',
        tenant_id: tenantId,
      })
      .select('id')
      .maybeSingle();

    if (unitError) return { error: unitError.message };
    if (!newUnit) return { error: 'Failed to create unit' };
    unitId = newUnit.id;
  }

  if (data.leaseStart && data.leaseEnd) {
    await supabase.from('leases').insert({
      tenant_id: tenantId,
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
    rejectionReason: p.rejection_reason ?? undefined,
    approvedBy: p.approved_by ?? undefined,
    approvedAt: p.approved_at ?? undefined,
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
  const [propsRes, unitsRes, profilesRes, maintenanceRes] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }),
    supabase.from('units').select('id, status'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tenant'),
    supabase.from('maintenance_requests').select('status'),
  ]);

  const units = unitsRes.data || [];
  const maintRows = maintenanceRes.data || [];
  const allUnitIds = units.map((u) => u.id);

  let payRows: any[] = [];
  if (allUnitIds.length > 0) {
    const { data } = await supabase
      .from('payments')
      .select('amount, status')
      .in('unit_id', allUnitIds);
    payRows = data || [];
  }

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const monthlyRevenue = payRows
    .filter((p) => p.status === 'paid' || p.status === 'approved')
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payRows
    .filter((p) => p.status === 'pending' || p.status === 'pending_verification')
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
    totalTenants: occupiedUnits,
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
    supabase.from('units').select('id, status, monthly_rent, tenant_id').in('property_id', pIds),
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
    .filter((p: any) => p.status === 'pending' || p.status === 'pending_verification')
    .reduce((s: number, p: any) => s + Number(p.amount), 0);
  const overdueAmount = payRows
    .filter((p: any) => p.status === 'overdue')
    .reduce((s: number, p: any) => s + Number(p.amount), 0);
  const activeMaintenance = maintList.filter(
    (m: any) => m.status !== 'completed' && m.status !== 'cancelled'
  ).length;

  return {
    totalProperties: pIds.length,
    totalUnits, occupiedUnits,
    vacantUnits: totalUnits - occupiedUnits, monthlyRevenue,
    occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0,
    pendingPayments, overdueAmount, activeMaintenance,
    totalTenants: occupiedUnits,
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
    rejectionReason: p.rejection_reason ?? undefined,
    approvedBy: p.approved_by ?? undefined,
    approvedAt: p.approved_at ?? undefined,
  }));
}

// ─── Revenue Data ────────────────────────────────────────
export async function fetchRevenueData(): Promise<RevenueData[]> {
  const { data: paid } = await supabase
    .from('payments')
    .select('amount, paid_date')
    .in('status', ['paid', 'approved'])
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
    .in('status', ['paid', 'approved'])
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
    tenants: units.filter((u) => u.tenant_id).map((unit) => {
      const profile = tenantProfiles.find((p) => p.id === unit.tenant_id);
      if (!profile) return null;
      const lastPay = allPayments.find((pay) => pay.tenant_id === unit.tenant_id && pay.unit_id === unit.id);
      return {
        id: profile.id, name: profile.name, unitNumber: unit.unit_number || '',
        status: lastPay?.status || 'pending', rentAmount: unit.monthly_rent || 0,
        unitId: unit.id,
      };
    }).filter(Boolean),
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
export async function fetchTenantDashboardData(userId: string) {
  const [{ data: allUnits }, { data: allLeases }, { data: maint }] = await Promise.all([
    supabase.from('units').select('*').eq('tenant_id', userId),
    supabase.from('leases').select('*').eq('tenant_id', userId).eq('status', 'active'),
    supabase.from('maintenance_requests').select('*').eq('tenant_id', userId).neq('status', 'completed').order('created_at', { ascending: false }).limit(2),
  ]);

  const units = allUnits || [];
  const leases = allLeases || [];

  const propertyIds = [...new Set(units.map((u) => u.property_id).filter(Boolean))];
  let propertyMap = new Map<string, any>();
  if (propertyIds.length > 0) {
    const { data: props } = await supabase.from('properties').select(PROP_COLS).in('id', propertyIds);
    (props || []).forEach((p: any) => propertyMap.set(p.id, p));
  }

  const unit = units[0] || null;
  const prop = unit ? propertyMap.get(unit.property_id) || null : null;
  const lease = leases[0] || null;

  return {
    unit,
    units,
    property: prop,
    lease,
    maintenance: maint || [],
    totalRent: units.reduce((sum, u) => sum + Number(u.monthly_rent || 0), 0),
  };
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

// ─── Create Payment ──────────────────────────────────────
export async function createPayment(data: {
  tenantId: string;
  unitId: string;
  amount: number;
  method: 'mpesa' | 'bank' | 'cash';
  transactionId?: string;
  receiptId?: string;
}): Promise<{ error?: string; payment?: any }> {
  const { data: inserted, error } = await supabase
    .from('payments')
    .insert({
      tenant_id: data.tenantId,
      unit_id: data.unitId,
      amount: data.amount,
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending_verification',
      method: data.method,
      transaction_id: data.transactionId || null,
      receipt_id: data.receiptId || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { payment: inserted };
}

export async function approvePayment(paymentId: string, landlordId: string): Promise<{ error?: string }> {
  const { data: payment, error: fetchErr } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single();

  if (fetchErr || !payment) return { error: 'Payment not found' };

  const tenantId = payment.tenant_id;
  const paymentAmount = Number(payment.amount);

  const { data: tenantUnits } = await supabase
    .from('units')
    .select('id, monthly_rent, credit')
    .eq('tenant_id', tenantId);

  const units = tenantUnits || [];
  if (units.length === 0) return { error: 'No units found for this tenant' };

  const totalOwed = units.reduce((s, u) => s + Number(u.monthly_rent || 0), 0);

  const sortedUnits = [...units].sort((a, b) => Number(a.monthly_rent) - Number(b.monthly_rent));

  let remaining = paymentAmount;
  const unitUpdates: Promise<any>[] = [];

  for (const unit of sortedUnits) {
    const rent = Number(unit.monthly_rent);
    const existingCredit = Number(unit.credit || 0);

    if (remaining >= rent) {
      remaining -= rent;
      unitUpdates.push(
        supabase.from('units').update({ credit: 0 }).eq('id', unit.id).then()
      );
    } else if (remaining + existingCredit >= rent) {
      remaining = 0;
      unitUpdates.push(
        supabase.from('units').update({ credit: 0 }).eq('id', unit.id).then()
      );
    } else if (remaining > 0) {
      const newCredit = existingCredit + remaining;
      remaining = 0;
      unitUpdates.push(
        supabase.from('units').update({ credit: newCredit }).eq('id', unit.id).then()
      );
    }
  }

  await Promise.all(unitUpdates);

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'approved',
      approved_by: landlordId,
      approved_at: new Date().toISOString(),
      paid_date: new Date().toISOString(),
    })
    .eq('id', paymentId);

  if (error) return { error: error.message };
  return {};
}

export async function rejectPayment(paymentId: string, reason: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'rejected',
      rejection_reason: reason,
    })
    .eq('id', paymentId);

  if (error) return { error: error.message };
  return {};
}

// ─── Tenant Payments (for tenant portal) ──────────────
export async function fetchTenantPayments(tenantId: string): Promise<Payment[]> {
  const { data: tenantUnits, error: unitsError } = await supabase
    .from('units')
    .select('id, unit_number')
    .eq('tenant_id', tenantId);

  if (unitsError) throw new Error(`Failed to fetch units: ${unitsError.message}`);
  if (!tenantUnits || tenantUnits.length === 0) return [];

  const validUnitIds = tenantUnits.map((u) => u.id);
  const unitMap = new Map(tenantUnits.map((u) => [u.id, u.unit_number]));

  const { data: payRows, error } = await supabase
    .from('payments')
    .select('*')
    .in('unit_id', validUnitIds)
    .order('due_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch payments: ${error.message}`);
  if (!payRows) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', tenantId)
    .single();

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
    rejectionReason: p.rejection_reason ?? undefined,
    approvedBy: p.approved_by ?? undefined,
    approvedAt: p.approved_at ?? undefined,
  }));
}
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
