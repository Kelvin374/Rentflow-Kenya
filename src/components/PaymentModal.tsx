'use client';

import { useState } from 'react';
import { X, Smartphone, Banknote, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'auto' | 'manual';
  tenantName?: string;
  unitNumber?: string;
  defaultAmount?: number;
  onPaymentComplete?: () => void;
}

export function PaymentModal({
  isOpen, onClose, mode = 'auto',
  tenantName, unitNumber, defaultAmount,
  onPaymentComplete,
}: PaymentModalProps) {
  const [phone, setPhone] = useState('2547');
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [method, setMethod] = useState<'mpesa' | 'bank' | 'cash'>('mpesa');
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'done'>('form');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleManualRecord = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('done');
      onPaymentComplete?.();
    }, 1500);
  };

  const isAuto = mode === 'auto';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isAuto ? <Smartphone size={20} className="text-primary" /> : <Banknote size={20} className="text-warning" />}
            <h2 className="text-lg font-semibold">{isAuto ? 'M-PESA Payment' : 'Record Payment'}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {tenantName && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm">
            <span className="text-gray-500">Tenant: </span>
            <span className="font-medium text-gray-900">{tenantName}</span>
            {unitNumber && <span className="text-gray-400"> &middot; {unitNumber}</span>}
          </div>
        )}

        {step === 'form' && !isAuto && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="flex gap-2">
                {(['mpesa', 'bank', 'cash'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setMethod(m)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      method === m
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KSH)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter amount" required />
            </div>
            <Button type="button" onClick={handleManualRecord} className="w-full">Record Payment</Button>
          </form>
        )}

        {step === 'form' && isAuto && (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="2547XXXXXXXX" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KSH)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter amount" required />
            </div>
            <Button type="submit" className="w-full">Confirm & Pay</Button>
          </form>
        )}

        {step === 'confirm' && isAuto && (
          <div className="p-5 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium">{phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold text-lg">KSh {parseInt(amount).toLocaleString()}</span></div>
            </div>
            <Button onClick={() => setStep('processing')} className="w-full">Send STK Push</Button>
            <button onClick={() => setStep('form')} className="w-full text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center animate-pulse ${
              isAuto ? 'bg-primary/10' : 'bg-warning/10'
            }`}>
              {isAuto ? <Smartphone size={32} className="text-primary" /> : <Banknote size={32} className="text-warning" />}
            </div>
            <p className="font-semibold">{isAuto ? 'Processing Payment...' : 'Recording Payment...'}</p>
            <p className="text-sm text-gray-500">
              {isAuto ? 'Check your phone for the M-PESA PIN prompt' : 'Updating payment records...'}
            </p>
            {isAuto && (
              <Button onClick={() => setStep('done')} variant="ghost" className="mt-4">I've Entered PIN</Button>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-success" />
            </div>
            <p className="font-semibold text-success">Payment Successful!</p>
            <p className="text-sm text-gray-500">
              Payment of KSh {parseInt(amount).toLocaleString()} has been {isAuto ? 'received' : 'recorded'}.
            </p>
            <Button onClick={onClose} className="mt-4">Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}
