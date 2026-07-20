'use client';

import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: string;
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, amount = '45,000', onSuccess }: PaymentModalProps) {
  const [phone, setPhone] = useState('2547');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  if (!isOpen) return null;

  const handlePay = async () => {
    if (phone.length < 10) return;
    setStep('processing');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2500));
    setLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setPhone('2547');
    onClose();
  };

  const handleDone = () => {
    handleClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">Pay Rent via M-Pesa</h3>
              <button onClick={handleClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#1EB952]/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Amount Due</span>
                <span className="text-xl font-bold text-on-surface">KES {amount}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <p className="text-xs text-on-surface-variant mb-4">
              You will receive an STK push prompt on your phone to complete the payment.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border border-outline-variant font-semibold text-sm text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={phone.length < 10}
                className="flex-1 py-3 rounded-xl bg-[#1EB952] text-white font-semibold text-sm hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                Pay Now
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1EB952]/10 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-3 border-[#1EB952] border-t-transparent rounded-full animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-2">Processing Payment</h4>
            <p className="text-sm text-on-surface-variant">Waiting for M-Pesa confirmation...</p>
            <p className="text-xs text-on-surface-variant mt-2">Check your phone for the STK prompt</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1EB952]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#1EB952] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-2">Payment Successful!</h4>
            <p className="text-sm text-on-surface-variant mb-1">KES {amount} has been paid via M-Pesa</p>
            <p className="text-xs text-on-surface-variant mb-6">Transaction recorded successfully.</p>
            <button
              onClick={handleDone}
              className="w-full py-3 rounded-xl bg-[#1EB952] text-white font-semibold text-sm hover:opacity-95 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
