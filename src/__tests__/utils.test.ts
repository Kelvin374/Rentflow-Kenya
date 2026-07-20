import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  getInitials,
  getStatusColor,
  formatDate,
  haversineDistance,
  formatDistance,
  geocodeLocation,
  getNearbyAreas,
  cn,
} from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats Kenyan Shillings correctly', () => {
    expect(formatCurrency(1500)).toContain('1,500');
    expect(formatCurrency(0)).toContain('0');
  });

  it('handles large numbers', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('1,500,000');
  });
});

describe('getInitials', () => {
  it('returns initials from full name', () => {
    expect(getInitials('John Kamau')).toBe('JK');
  });

  it('handles single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getStatusColor', () => {
  it('returns correct color classes', () => {
    expect(getStatusColor('paid')).toContain('success');
    expect(getStatusColor('pending')).toContain('warning');
    expect(getStatusColor('overdue')).toContain('danger');
  });
});

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2026-01-15');
    expect(result).toBeTruthy();
  });
});

describe('haversineDistance', () => {
  it('returns 0 for same coordinates', () => {
    const p = { latitude: -1.2864, longitude: 36.8172 };
    expect(haversineDistance(p, p)).toBe(0);
  });

  it('calculates distance between two Nairobi points', () => {
    const cbd = { latitude: -1.2864, longitude: 36.8172 };
    const westlands = { latitude: -1.2641, longitude: 36.8035 };
    const dist = haversineDistance(cbd, westlands);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(4);
  });
});

describe('formatDistance', () => {
  it('formats km distances', () => {
    expect(formatDistance(5.5)).toBe('5.5 km');
  });

  it('formats meters for short distances', () => {
    expect(formatDistance(0.3)).toBe('300m');
  });

  it('formats 0 distance', () => {
    expect(formatDistance(0)).toBe('0m');
  });
});

describe('geocodeLocation', () => {
  it('returns coordinates for known Nairobi locations', () => {
    const result = geocodeLocation('Westlands, Nairobi');
    expect(result).not.toBeNull();
    expect(result!.latitude).toBeCloseTo(-1.2641, 0);
  });

  it('returns null for unknown locations', () => {
    const result = geocodeLocation('Atlantis');
    expect(result).toBeNull();
  });

  it('handles partial matches', () => {
    const result = geocodeLocation('Kilimani');
    expect(result).not.toBeNull();
  });
});

describe('getNearbyAreas', () => {
  it('returns areas within radius', () => {
    const center = { latitude: -1.2864, longitude: 36.8172 };
    const areas = getNearbyAreas(center, 10);
    expect(areas.length).toBeGreaterThan(0);
  });

  it('returns fewer areas for smaller radius', () => {
    const center = { latitude: -1.2864, longitude: 36.8172 };
    const close = getNearbyAreas(center, 2);
    const far = getNearbyAreas(center, 20);
    expect(close.length).toBeLessThanOrEqual(far.length);
  });
});

describe('cn', () => {
  it('concatenates class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });
});
