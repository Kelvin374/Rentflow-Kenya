'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-8 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };

  const colorMap = {
    success: 'bg-tertiary text-on-tertiary',
    error: 'bg-error text-on-error',
    info: 'bg-primary text-on-primary',
  };

  return (
    <div
      className={`${colorMap[toast.type]} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[250px] animate-in slide-in-from-right fade-in duration-300`}
      onClick={() => onRemove(toast.id)}
    >
      <span className="material-symbols-outlined text-sm">{iconMap[toast.type]}</span>
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}
