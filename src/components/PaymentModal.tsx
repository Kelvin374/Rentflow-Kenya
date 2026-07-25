'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPayment, fetchTenants, fetchTenantUnitDetails, type TenantUnitDetail } from '@/lib/supabase-api';
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

  const [unitDetails, setUnitDetails] = useState<TenantUnitDetail[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());
  const [unitsLoading, setUnitsLoading] = useState(false);

  const isLandlordMode = !tenantId && !unitId && !!landlordId;
  const effectiveTenantId = tenantId || selectedTenantId;
  const effectiveUnitId = unitId || selectedUnitId;
  const isTenantMultiUnit = !isLandlordMode && !!tenantId;

  const totalCredit = unitDetails
    .filter((u) => selectedUnitIds.has(u.id))
    .reduce((s, u) => s + u.credit, 0);

  const totalRent = unitDetails
    .filter((u) => selectedUnitIds.has(u.id))
    .reduce((s, u) => s + u.monthlyRent, 0);

  const totalDue = Math.max(0, totalRent - totalCredit);

  const selectableUnits = unitDetails.filter((u) => !u.alreadyPaid);
  const paidUnits = unitDetails.filter((u) => u.alreadyPaid);

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
    if (isOpen && isTenantMultiUnit && tenantId) {
      setUnitsLoading(true);
      fetchTenantUnitDetails(tenantId)
        .then((details) => {
          setUnitDetails(details);
          const autoSelect = new Set(details.filter((u) => !u.alreadyPaid).map((u) => u.id));
          setSelectedUnitIds(autoSelect);
        })
        .catch(() => {})
        .finally(() => setUnitsLoading(false));
    } else if (isOpen && !isTenantMultiUnit && !isLandlordMode && unitId) {
      setSelectedUnitIds(new Set([unitId]));
    }
  }, [isOpen, tenantId, unitId, isTenantMultiUnit, isLandlordMode]);

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

  useEffect(() => {
    if (isTenantMultiUnit && selectedUnitIds.size > 0) {
      setAmountInput(String(totalDue));
    }
  }, [selectedUnitIds, totalDue, isTenantMultiUnit]);

  if (!isOpen) return null;

  const displayAmount = isTenantMultiUnit ? totalDue : Number((amountInput || '0').replace(/,/g, ''));
  const canSubmitForm = isLandlordMode
    ? effectiveTenantId && effectiveUnitId && Number((amountInput || '0').replace(/,/g, '')) > 0
    : isTenantMultiUnit
      ? selectedUnitIds.size > 0 && totalDue > 0
      : phone.length >= 10 && Number((amountInput || '0').replace(/,/g, '')) > 0;

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

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
    const finalAmount = isTenantMultiUnit
      ? totalDue
      : Number((String(displayAmount) || '0').replace(/,/g, ''));

    if (finalAmount <= 0) return;
    if (!effectiveTenantId && !isLandlordMode) return;

    setErrorMsg('');

    const txnId = isLandlordMode
      ? (txnInput || `TXN${Date.now()}`)
      : `MP${Date.now()}`;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isTenantMultiUnit && selectedUnitIds.size > 0) {
      let lastError = '';
      for (const uid of Array.from(selectedUnitIds)) {
        const unit = unitDetails.find((u) => u.id === uid);
        if (!unit) continue;
        const unitAmount = Math.max(0, unit.monthlyRent - unit.credit);
        if (unitAmount <= 0) continue;

        const result = await createPayment({
          tenantId: effectiveTenantId!,
          unitId: uid,
          amount: unitAmount,
          method,
          transactionId: txnId,
        });
        if (result.error) lastError = result.error;
      }
      if (lastError) {
        setErrorMsg(lastError);
        setStep('error');
      } else {
        setStep('success');
      }
    } else {
      const targetUnitId = effectiveUnitId;
      if (!targetUnitId) return;
      const result = await createPayment({
        tenantId: effectiveTenantId!,
        unitId: targetUnitId,
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
    }
  };

  const handleClose = () => {
    setStep('form');
    setErrorMsg('');
    setPin('');
    setUnitDetails([]);
    setSelectedUnitIds(new Set());
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
              <h3 className="text-lg font-bold text-on-surface">{isLandlordMode ? 'Record Payment' : 'Pay Rent'}</h3>
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

            {/* Multi-Unit Selection (tenant mode) */}
            {isTenantMultiUnit && (
              <div className="mb-4">
                <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Select Units to Pay</label>
                {unitsLoading ? (
                  <div className="py-6 text-center text-sm text-on-surface-variant">Loading units...</div>
                ) : unitDetails.length === 0 ? (
                  <div className="py-6 text-center text-sm text-on-surface-variant">No units found.</div>
                ) : (
                  <div className="space-y-2">
                    {unitDetails.map((u) => {
                      const isSelected = selectedUnitIds.has(u.id);
                      const netAmount = Math.max(0, u.monthlyRent - u.credit);
                      return (
                        <button
                          key={u.id}
                          onClick={() => !u.alreadyPaid && toggleUnit(u.id)}
                          disabled={u.alreadyPaid}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                            u.alreadyPaid
                              ? 'border-outline-variant/50 bg-surface-container-lowest opacity-50 cursor-not-allowed'
                              : isSelected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                : 'border-outline-variant hover:bg-surface-container-low'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            u.alreadyPaid
                              ? 'border-outline-variant bg-surface-container-lowest'
                              : isSelected
                                ? 'border-primary bg-primary'
                                : 'border-outline-variant'
                          }`}>
                            {isSelected && !u.alreadyPaid && (
                              <svg className="w-3 h-3 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-on-surface">
                                {u.unitNumber}{u.propertyName ? ` · ${u.propertyName}` : ''}
                              </span>
                              {u.alreadyPaid ? (
                                <span className="text-xs font-medium text-success">Paid</span>
                              ) : (
                                <span className="text-sm font-bold text-on-surface">{formatCurrency(netAmount)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-on-surface-variant">Rent: {formatCurrency(u.monthlyRent)}</span>
                              {u.credit > 0 && (
                                <span className="text-xs text-success font-medium">Credit: -{formatCurrency(u.credit)}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Amount (always read-only in tenant multi-unit mode) */}
            {!isLandlordMode && isTenantMultiUnit && selectedUnitIds.size > 0 && (
              <div className="mb-4 bg-surface-container rounded-xl p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Total rent ({selectedUnitIds.size} unit{selectedUnitIds.size !== 1 ? 's' : ''})</span>
                  <span className="text-on-surface">{formatCurrency(totalRent)}</span>
                </div>
                {totalCredit > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-success">Credit applied</span>
                    <span className="text-success font-medium">-{formatCurrency(totalCredit)}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant mt-2 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-on-surface">Total due</span>
                  <span className="text-on-surface">{formatCurrency(totalDue)}</span>
                </div>
              </div>
            )}

            {/* Amount (landlord or single unit tenant) */}
            {(!isTenantMultiUnit || isLandlordMode) && (
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
            )}

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
                <span className="font-bold text-on-surface">{formatCurrency(displayAmount)}</span>
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
            <p className="text-sm text-on-surface-variant mb-6">Enter your 4-digit PIN to confirm payment of <strong>{formatCurrency(displayAmount)}</strong></p>

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
              KES {formatCurrency(displayAmount)} has been {isLandlordMode ? 'recorded' : 'submitted'}.
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
