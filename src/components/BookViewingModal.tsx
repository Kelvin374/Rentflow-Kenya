'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import { bookViewingAppointment } from '@/lib/supabase-api';

interface Property {
  id: number;
  name: string;
  price: string;
  rating: string;
  university: string;
  beds: string;
  image: string;
  images?: string[];
  contactPhone?: string;
  contactEmail?: string;
}

interface BookViewingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookViewingModal({ property, isOpen, onClose }: BookViewingModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !property) return null;

  const hasContact = !!(property.contactPhone || property.contactEmail);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!property) return;
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    setSubmitting(true);
    const result = await bookViewingAppointment({
      propertyId: String(property.id),
      tenantId: user?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      preferredDate: preferredDate || undefined,
      notes: notes.trim(),
    });
    setSubmitting(false);
    if (result.error) {
      showToast('Failed to book viewing. Please try again.', 'error');
    } else {
      setSubmitted(true);
      showToast('Viewing booked! The property manager will contact you.', 'success');
    }
  }

  function handleClose() {
    setName('');
    setEmail('');
    setPhone('');
    setPreferredDate('');
    setNotes('');
    setSubmitted(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${property.images?.[0] || property.image}')` }}
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

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-tertiary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary text-3xl">check_circle</span>
              </div>
              <h4 className="text-xl font-bold text-on-surface mb-2">Viewing Booked!</h4>
              <p className="text-sm text-on-surface-variant mb-6">
                The property manager will reach out to confirm your appointment.
              </p>

              {hasContact && (
                <div className="space-y-3 mb-6 text-left">
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Or contact directly</p>
                  {property.contactPhone && (
                    <a
                      href={`tel:${property.contactPhone}`}
                      className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">call</span>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Phone</p>
                        <p className="font-semibold text-sm">{property.contactPhone}</p>
                      </div>
                    </a>
                  )}
                  {property.contactEmail && (
                    <a
                      href={`mailto:${property.contactEmail}`}
                      className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">mail</span>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Email</p>
                        <p className="font-semibold text-sm">{property.contactEmail}</p>
                      </div>
                    </a>
                  )}
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-95 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
                </div>
                <h4 className="text-xl font-bold text-on-surface mb-2">Schedule a Viewing</h4>
                <p className="text-sm text-on-surface-variant">
                  Fill in your details and preferred date to book a viewing.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Preferred Date & Time</label>
                  <input
                    type="datetime-local"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant block mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any questions or special requests..."
                    rows={3}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                {hasContact && (
                  <div className="bg-surface-container-low rounded-xl p-4 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] align-middle mr-1">info</span>
                    You can also contact the property manager directly by phone or email.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Book Viewing'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-surface-container-low text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
