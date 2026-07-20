'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen, title, message, warning, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-danger/10' : 'bg-warning/10'
          }`}>
            <AlertTriangle size={20} className={variant === 'danger' ? 'text-danger' : 'text-warning'} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
        {warning && (
          <div className={`p-3 rounded-lg text-sm ${
            variant === 'danger' ? 'bg-danger/5 text-danger border border-danger/20' : 'bg-warning/5 text-warning border border-warning/20'
          }`}>
            {warning}
          </div>
        )}
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className={variant === 'warning' ? 'bg-warning text-white hover:bg-warning/90' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
