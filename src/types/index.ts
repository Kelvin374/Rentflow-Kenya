export type UserRole = 'landlord' | 'manager' | 'caretaker' | 'tenant' | 'admin';
export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  subscription: SubscriptionTier;
  createdAt: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  label: string;
  price: string;
  maxUnits: number;
  autoReconcile: boolean;
  features: string[];
}

export interface PaymentInfo {
  mpesaPaybill: string;
  mpesaAccount: string;
  tillNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccount: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  image?: string;
  landlordId: string;
  paymentInfo?: PaymentInfo;
  createdAt: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  type: string;
  monthlyRent: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  unitId: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
  status: 'paid' | 'pending' | 'overdue';
  leaseStart: string;
  leaseEnd: string;
  emergencyContact?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  method: 'mpesa' | 'bank' | 'cash';
  transactionId?: string;
  receiptId?: string;
  unitNumber: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  category: 'plumbing' | 'electrical' | 'security' | 'painting' | 'water' | 'cleaning' | 'general';
  description: string;
  priority: 'low' | 'normal' | 'urgent';
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed';
  assignedTo?: string;
  images?: string[];
  createdAt: string;
  completedAt?: string;
  progress?: number;
  cost?: number;
}

export interface LeaseAgreement {
  id: string;
  tenantId: string;
  propertyId: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  terms: string;
  status: 'active' | 'expired' | 'terminated';
  signedByTenant: boolean;
  signedByLandlord: boolean;
}

export interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingPayments: number;
  overdueAmount: number;
  activeMaintenance: number;
  totalTenants: number;
}

export interface RevenueData {
  month: string;
  amount: number;
}
