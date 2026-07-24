import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    overdue: 'bg-danger/10 text-danger',
    pending_verification: 'bg-blue-100 text-blue-600',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-danger/10 text-danger',
    occupied: 'bg-success/10 text-success',
    vacant: 'bg-gray-100 text-gray-500',
    maintenance: 'bg-warning/10 text-warning',
    submitted: 'bg-blue-100 text-blue-600',
    assigned: 'bg-warning/10 text-warning',
    in_progress: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    active: 'bg-success/10 text-success',
    expired: 'bg-gray-100 text-gray-500',
    terminated: 'bg-danger/10 text-danger',
    low: 'bg-gray-100 text-gray-500',
    normal: 'bg-primary/10 text-primary',
    urgent: 'bg-danger/10 text-danger',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return colors[status] || 'bg-gray-100 text-gray-500';
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    plumbing: '🔧',
    electrical: '⚡',
    security: '🔒',
    painting: '🎨',
    water: '💧',
    cleaning: '🧹',
    general: '🔨',
  };
  return icons[category] || '🔧';
}

// ─── Location & Proximity ────────────────────────────────

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export const NAIROBI_AREAS: Record<string, GeoPoint> = {
  'westlands':      { latitude: -1.2641, longitude: 36.8035 },
  'kilimani':       { latitude: -1.2921, longitude: 36.7846 },
  'lavington':      { latitude: -1.2773, longitude: 36.7630 },
  'karen':          { latitude: -1.3197, longitude: 36.7076 },
  'cbd':            { latitude: -1.2864, longitude: 36.8172 },
  'central business district': { latitude: -1.2864, longitude: 36.8172 },
  'south b':        { latitude: -1.2962, longitude: 36.8580 },
  'south c':        { latitude: -1.3103, longitude: 36.8580 },
  'kileleshwa':     { latitude: -1.2817, longitude: 36.7766 },
  'hurlingham':     { latitude: -1.2886, longitude: 36.7913 },
  'pangani':        { latitude: -1.2633, longitude: 36.8313 },
  'eastleigh':      { latitude: -1.2833, longitude: 36.8500 },
  'langata':        { latitude: -1.3350, longitude: 36.7350 },
  'runda':          { latitude: -1.2281, longitude: 36.7765 },
  'muthaiga':       { latitude: -1.2533, longitude: 36.7933 },
  'parklands':      { latitude: -1.2610, longitude: 36.7930 },
  'spring valley':  { latitude: -1.2420, longitude: 36.7800 },
  'loresho':        { latitude: -1.2530, longitude: 36.7630 },
  'kabete':         { latitude: -1.2470, longitude: 36.7390 },
  'utawala':        { latitude: -1.2780, longitude: 36.8930 },
  'ruaka':          { latitude: -1.2290, longitude: 36.7690 },
  'kiambu':         { latitude: -1.1715, longitude: 36.8300 },
  'roysambu':       { latitude: -1.2300, longitude: 36.8130 },
  'kasarani':       { latitude: -1.2280, longitude: 36.8430 },
  'ridgeways':      { latitude: -1.2220, longitude: 36.8080 },
  'garden city':    { latitude: -1.2190, longitude: 36.8120 },
  'thika road':     { latitude: -1.2340, longitude: 36.8350 },
  'donholm':        { latitude: -1.2880, longitude: 36.8740 },
  'buruburu':       { latitude: -1.2810, longitude: 36.8620 },
  'zoo road':       { latitude: -1.2770, longitude: 36.8280 },
  'ngara':          { latitude: -1.2690, longitude: 36.8150 },
  'highfield':      { latitude: -1.2870, longitude: 36.8470 },
  'pipeline':       { latitude: -1.2750, longitude: 36.8870 },
  'embakasi':       { latitude: -1.2900, longitude: 36.8820 },
  'kawangware':     { latitude: -1.2650, longitude: 36.7480 },
  'dagoretti':      { latitude: -1.2870, longitude: 36.7450 },
  'mutuini':        { latitude: -1.3050, longitude: 36.7300 },
  'bomas':          { latitude: -1.3270, longitude: 36.7170 },
  'nyayo estate':   { latitude: -1.3080, longitude: 36.8560 },
  'madaraka':       { latitude: -1.3030, longitude: 36.8380 },
  'magadi road':    { latitude: -1.3400, longitude: 36.7200 },
  'gigiri':         { latitude: -1.2320, longitude: 36.7930 },
  'redhill':        { latitude: -1.2180, longitude: 36.7740 },
  'kitengela':      { latitude: -1.4380, longitude: 36.8580 },
  'athi river':     { latitude: -1.4520, longitude: 36.8830 },
  'syokimau':       { latitude: -1.3780, longitude: 36.8830 },
  'imara daima':    { latitude: -1.3630, longitude: 36.8720 },
  'ubungo':         { latitude: -1.3490, longitude: 36.8600 },
};

const EARTH_RADIUS_KM = 6371;

export function haversineDistance(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function geocodeLocation(locationText: string): GeoPoint | null {
  const lower = locationText.toLowerCase().trim();
  for (const [area, coords] of Object.entries(NAIROBI_AREAS)) {
    if (lower.includes(area)) return coords;
  }
  return null;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

export function getNearbyAreas(center: GeoPoint, radiusKm: number): string[] {
  return Object.entries(NAIROBI_AREAS)
    .filter(([, coords]) => haversineDistance(center, coords) <= radiusKm)
    .map(([area]) => area.charAt(0).toUpperCase() + area.slice(1));
}
