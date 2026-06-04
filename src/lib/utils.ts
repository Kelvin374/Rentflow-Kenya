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
