'use client';

import { useState } from 'react';

interface Property {
  id: number;
  name: string;
  price: string;
  rating: string;
  university: string;
  beds: string;
  image: string;
}

interface BookViewingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

export default function BookViewingModal({ property, isOpen, onClose }: BookViewingModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [phone, setPhone] = useState('2547');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !property) return null;

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateValue = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setSelectedDate('');
    setSelectedTime('');
    setPhone('2547');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${property.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg leading-tight">{property.name}</h3>
            <p className="text-white/80 text-sm">KES {property.price}/mo · {property.beds}</p>
          </div>
        </div>

        {step === 'form' ? (
          <div className="p-6">
            <h4 className="font-bold text-on-surface mb-4">Schedule a Viewing</h4>

            {/* Date Selection */}
            <div className="mb-4">
              <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {getNextDays().map((date) => {
                  const dateVal = formatDateValue(date);
                  const isSelected = selectedDate === dateVal;
                  return (
                    <button
                      key={dateVal}
                      onClick={() => setSelectedDate(dateVal)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-center transition-all border ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary shadow-md'
                          : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase">{date.toLocaleDateString('en-KE', { weekday: 'short' })}</div>
                      <div className="text-lg font-bold">{date.getDate()}</div>
                      <div className="text-[10px]">{date.toLocaleDateString('en-KE', { month: 'short' })}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Select Time</label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary shadow-md'
                          : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or questions..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border border-outline-variant font-semibold text-sm text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || loading}
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-green-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-2">Viewing Booked!</h4>
            <p className="text-sm text-on-surface-variant mb-2">
              Your viewing at <strong>{property.name}</strong> is confirmed.
            </p>
            <div className="bg-surface-container rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
                  <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-KE', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="w-px h-4 bg-outline-variant" />
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mb-6">
              You&apos;ll receive a confirmation via SMS. The property manager will contact you shortly.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-95 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
