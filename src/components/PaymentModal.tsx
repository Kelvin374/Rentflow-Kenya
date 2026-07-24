'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPayment, fetchTenants } from '@/lib/supabase-api';
import { formatCurrency } from '@/lib/utils';
import type { Tenant } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: string;
  tenantId?: string;
  unitId?: string;
  landlordId?: string;
  onSuccess?: () => void;
}

type Step = 'form' | 'stk_push' | 'pin' | 'processing' | 'success' | 'error';

export function PaymentModal({ isOpen, onClose, amount = '0', tenantId, unitId, landlordId, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(tenantId || '');
  const [selectedUnitId, setSelectedUnitId] = useState(unitId || '');
  const [phone, setPhone] = useState('2547');
  const [amountInput, setAmountInput] = useState(amount === '0' ? '' : amount);
  const [method, setMethod] = useState<'mpesa' | 'bank' | 'cash'>('mpesa');
  const [txnInput, setTxnInput] = useState('');
  const [pin, setPin] = useState('');
  const [stkTimer, setStkTimer] = useState(0);

  const isLandlordMode = !tenantId && !unitId && !!landlordId;
  const effectiveTenantId = tenantId || selectedTenantId;
  const effectiveUnitId = unitId || selectedUnitId;
  const effectiveAmount = isLandlordMode ? amountInput : amountInput;

  useEffect(() => {
    if (isOpen && isLandlordMode && landlordId) {
      fetchTenants(landlordId).then(setTenants).catch(() => {});
    }
  }, [isOpen, isLandlordMode]);

  useEffect(() => {
    if (isLandlordMode && selectedTenantId) {
      const t = tenants.find((tn) => tn.id === selectedTenantId);
      if (t) {
        setSelectedUnitId(t.unitId);
        if (!amountInput) setAmountInput(String(t.rentAmount || ''));
      }
    }
  }, [selectedTenantId, tenants]);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrorMsg('');
      setSelectedTenantId(tenantId || '');
      setSelectedUnitId(unitId || '');
      setAmountInput(amount === '0' ? '' : amount);
      setPhone('2547');
      setMethod('mpesa');
      setTxnInput('');
      setPin('');
      setStkTimer(0);
    }
  }, [isOpen, tenantId, unitId, amount]);

  useEffect(() => {
    if (step === 'stk_push') {
      setStkTimer(0);
      const interval = setInterval(() => {
        setStkTimer((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            setStep('pin');
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const canSubmitForm = isLandlordMode
    ? effectiveTenantId && effectiveUnitId && Number((amountInput || '0').replace(/,/g, '')) > 0
    : phone.length >= 10 && Number((amountInput || '0').replace(/,/g, '')) > 0;

  const handleFormSubmit = () => {
    if (!canSubmitForm) return;
    if (isLandlordMode) {
      setStep('processing');
      processPayment();
    } else {
      setStep('stk_push');
    }
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) return;
    setStep('processing');
    processPayment();
  };

  const processPayment = async () => {
    const finalAmount = Number((effectiveAmount || '0').replace(/,/g, ''));
    if (!effectiveTenantId || !effectiveUnitId || finalAmount <= 0) return;

    setErrorMsg('');

    const txnId = isLandlordMode
      ? (txnInput || `TXN${Date.now()}`)
      : `MP${Date.now()}`;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = await createPayment({
      tenantId: effectiveTenantId,
      unitId: effectiveUnitId,
      amount: finalAmount,
      method,
      transactionId: txnId,
    });

    if (result.error) {
      setErrorMsg(result.error);
      setStep('error');
    } else {
      setStep('success');
    }
  };

  const handleClose = () => {
    setStep('form');
    setErrorMsg('');
    setPin('');
    onClose();
  };

  const handleDone = () => {
    handleClose();
    onSuccess?.();
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Step: Form ── */}
        {step === 'form' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface">{isLandlordMode ? 'Record Payment' : 'Pay Rent via M-Pesa'}</h3>
              <button onClick={handleClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {isLandlordMode && (
              <div className="mb-4">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Tenant</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map((t) => (
                    <option key={`${t.id}-${t.unitId}`} value={t.id}>
                      {t.name} — Unit {t.unitNumber} ({formatCurrency(t.rentAmount)}/mo)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount */}
            <div className="mb-4">
              <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Amount (KES)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold text-sm">KES</span>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 pl-14 pr-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-lg font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            </div>

            {/* Payment Method (landlord mode only) */}
            {isLandlordMode && (
              <div className="mb-4">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Payment Method</label>
                <div className="flex gap-2">
                  {(['mpesa', 'bank', 'cash'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        method === m
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {m === 'mpesa' ? 'M-Pesa' : m === 'bank' ? 'Bank' : 'Cash'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Phone Number (tenant M-Pesa mode) */}
            {!isLandlordMode && (
              <div className="mb-4">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="2547XXXXXXXX"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            )}

            {/* Reference (landlord non-M-Pesa) */}
            {isLandlordMode && method !== 'mpesa' && (
              <div className="mb-4">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Reference (optional)</label>
                <input
                  type="text"
                  value={txnInput}
                  onChange={(e) => setTxnInput(e.target.value)}
                  placeholder="Cheque number, receipt, etc."
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
              </div>
            )}

            {method === 'mpesa' && !isLandlordMode && (
              <p className="text-xs text-on-surface-variant mb-4">
                An STK push will be sent to this number. You will enter your M-Pesa PIN on your phone.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border border-outline-variant font-semibold text-sm text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={!canSubmitForm}
                className="flex-1 py-3 rounded-xl bg-[#1EB952] text-white font-semibold text-sm hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                {isLandlordMode ? 'Record Payment' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step: STK Push Sent ── */}
        {step === 'stk_push' && (
          <div className="p-6 text-center">
            <button onClick={handleClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="w-20 h-20 mx-auto rounded-full bg-[#1EB952]/10 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[#1EB952] text-4xl">smartphone</span>
            </div>

            <h4 className="text-lg font-bold text-on-surface mb-2">STK Push Sent</h4>
            <p className="text-sm text-on-surface-variant mb-1">Check your phone</p>
            <p className="text-sm font-semibold text-on-surface mb-4">{phone}</p>

            <div className="bg-surface-container rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-on-surface-variant">Amount</span>
                <span className="font-bold text-on-surface">{formatCurrency(Number(effectiveAmount || 0))}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Paybill</span>
                <span className="font-medium text-on-surface">RentFlow</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#1EB952] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#1EB952] animate-pulse [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#1EB952] animate-pulse [animation-delay:0.4s]" />
            </div>

            <p className="text-xs text-on-surface-variant">
              An STK prompt has been sent to your phone. Enter your M-Pesa PIN when prompted.
            </p>
          </div>
        )}

        {/* ── Step: PIN Input ── */}
        {step === 'pin' && (
          <div className="p-6 text-center">
            <button onClick={handleClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-[#1EB952]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#1EB952] text-3xl">lock</span>
            </div>

            <h4 className="text-lg font-bold text-on-surface mb-1">Enter M-Pesa PIN</h4>
            <p className="text-sm text-on-surface-variant mb-6">Enter your 4-digit PIN to confirm payment of <strong>{formatCurrency(Number(effectiveAmount || 0))}</strong></p>

            {/* PIN Dots */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    i < pin.length ? 'bg-[#1EB952] scale-110' : 'bg-outline-variant'
                  }`}
                />
              ))}
            </div>

            {/* PIN Pad */}
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key) => {
                if (key === '') return <div key="empty" />;
                if (key === 'del') {
                  return (
                    <button
                      key="del"
                      onClick={handlePinDelete}
                      className="h-14 rounded-xl text-on-surface-variant font-medium text-sm hover:bg-surface-container transition-colors flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">backspace</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    onClick={() => handlePinInput(key)}
                    className="h-14 rounded-xl bg-surface-container text-on-surface font-semibold text-lg hover:bg-surface-container-high active:scale-95 transition-all"
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={pin.length < 4}
              className="mt-5 w-full max-w-[240px] mx-auto py-3 rounded-xl bg-[#1EB952] text-white font-semibold text-sm hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Confirm PIN
            </button>

            <button onClick={() => setStep('form')} className="mt-4 text-sm text-primary font-medium hover:underline">
              Change phone number
            </button>
          </div>
        )}

        {/* ── Step: Processing ── */}
        {step === 'processing' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1EB952]/10 flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-3 border-[#1EB952] border-t-transparent rounded-full animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-2">Processing Payment</h4>
            {isLandlordMode ? (
              <p className="text-sm text-on-surface-variant">Recording payment...</p>
            ) : (
              <>
                <p className="text-sm text-on-surface-variant">Waiting for M-Pesa confirmation...</p>
                <p className="text-xs text-on-surface-variant mt-2">Do not close this window</p>
              </>
            )}
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1EB952]/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#1EB952] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-2">
              {isLandlordMode ? 'Payment Recorded!' : 'Payment Successful!'}
            </h4>
            <p className="text-sm text-on-surface-variant mb-1">
              KES {formatCurrency(Number(effectiveAmount || 0))} has been {isLandlordMode ? 'recorded' : 'submitted'}.
            </p>
            <div className="bg-surface-container rounded-xl p-4 my-4 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">Status</span>
                <span className="font-medium text-warning">Pending Landlord Review</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface-variant">Transaction</span>
                <span className="font-mono text-xs text-on-surface">{isLandlordMode ? (txnInput || `TXN${Date.now()}`) : `MP${Date.now()}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Method</span>
                <span className="font-medium text-on-surface uppercase">{method}</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">
              {isLandlordMode
                ? 'This payment will appear as pending verification in your payment history.'
                : 'Your landlord will review and approve this payment. Your balance will update once approved.'}
            </p>
            <button
              onClick={handleDone}
              className="w-full py-3 rounded-xl bg-[#1EB952] text-white font-semibold text-sm hover:opacity-95 transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* ── Step: Error ── */}
        {step === 'error' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-2">Payment Failed</h4>
            <p className="text-sm text-on-surface-variant mb-6">{errorMsg || 'Something went wrong. Please try again.'}</p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border border-outline-variant font-semibold text-sm text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-95 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
