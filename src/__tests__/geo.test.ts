import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  geocodeLocation,
  getNearbyAreas,
  formatDistance,
} from '@/lib/utils';

describe('Geo utilities', () => {
  describe('haversineDistance', () => {
    it('returns 0 for identical points', () => {
      expect(haversineDistance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 })).toBe(0);
    });

    it('calculates correct distance between Nairobi CBD and Westlands', () => {
      const cbd = { latitude: -1.2864, longitude: 36.8172 };
      const westlands = { latitude: -1.2641, longitude: 36.8035 };
      const dist = haversineDistance(cbd, westlands);
      expect(dist).toBeGreaterThan(1.5);
      expect(dist).toBeLessThan(3);
    });

    it('handles far-apart points', () => {
      const nairobi = { latitude: -1.2864, longitude: 36.8172 };
      const mombasa = { latitude: -4.0435, longitude: 39.6682 };
      const dist = haversineDistance(nairobi, mombasa);
      expect(dist).toBeGreaterThan(400);
      expect(dist).toBeLessThan(500);
    });
  });

  describe('geocodeLocation', () => {
    it('geocodes well-known Nairobi neighborhoods', () => {
      const locations = [
        'Westlands, Nairobi',
        'Kilimani',
        'Karen, Nairobi',
        'Lavington',
        'CBD, Nairobi',
        'Syokimau',
      ];

      locations.forEach((loc) => {
        const result = geocodeLocation(loc);
        expect(result).not.toBeNull();
        expect(result!.latitude).toBeLessThan(0);
        expect(result!.longitude).toBeGreaterThan(36);
      });
    });

    it('returns null for completely unknown locations', () => {
      expect(geocodeLocation('Mars Colony 7')).toBeNull();
    });
  });

  describe('getNearbyAreas', () => {
    it('returns areas within radius as strings', () => {
      const center = { latitude: -1.2864, longitude: 36.8172 };
      const areas = getNearbyAreas(center, 50);
      expect(areas.length).toBeGreaterThan(0);
      areas.forEach((a) => expect(typeof a).toBe('string'));
    });

    it('filters out areas beyond the radius', () => {
      const center = { latitude: -1.2864, longitude: 36.8172 };
      const areas = getNearbyAreas(center, 1);
      expect(areas.length).toBeGreaterThan(0);
    });
  });

  describe('formatDistance', () => {
    it('formats distances under 1km as meters', () => {
      expect(formatDistance(0)).toBe('0m');
      expect(formatDistance(0.5)).toBe('500m');
    });

    it('formats distances 1km+ as km', () => {
      expect(formatDistance(1)).toBe('1.0 km');
      expect(formatDistance(5.7)).toBe('5.7 km');
    });
  });
});
