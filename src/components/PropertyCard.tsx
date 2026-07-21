'use client';

import Link from 'next/link';
import { Building2, TrendingUp, MoreVertical, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  href?: string;
}

export function PropertyCard({ property, href = '#' }: PropertyCardProps) {
  const occupancyRate = Math.round((property.occupiedUnits / property.units) * 100);
  const availableUnits = property.units - property.occupiedUnits;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {property.images?.[0] || property.image ? (
        <div className="h-40 overflow-hidden">
          <img src={property.images?.[0] || property.image} alt={property.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-primary to-primary-dark" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              {property.images?.[0] || property.image ? (
                <img src={property.images?.[0] || property.image} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={20} className="text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{property.name}</h3>
              <p className="text-sm text-gray-500">{property.location}</p>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{occupancyRate}% Occupied</span>
            <span>{property.occupiedUnits}/{property.units} Units</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Monthly Revenue</p>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(property.monthlyRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Available Units</p>
            <p className="text-sm font-semibold text-gray-900">{availableUnits > 0 ? `${availableUnits} Units` : 'Full'}</p>
          </div>
        </div>

        <Link href={href} className="w-full mt-2 flex items-center justify-between px-3 py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors">
          Manage <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
