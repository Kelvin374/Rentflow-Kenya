'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { fetchPropertyById, updateProperty, uploadPropertyImage } from '@/lib/supabase-api';
import { ArrowLeft, Smartphone, ChevronDown, ChevronUp, Camera, X, MapPin, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/Toast';
import type { PaymentInfo } from '@/types';
import { NAIROBI_AREAS, geocodeLocation } from '@/lib/utils';

const PROPERTY_TYPES = [
  'Bedsitter', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom',
  '4 Bedroom', '5 Bedroom', 'Penthouse', 'Townhouse', 'Villa',
  'Maisonette', 'Commercial', 'Office Space', 'Shop', 'Warehouse',
];

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const propertyId = params.id as string;

  const [form, setForm] = useState({ name: '', location: '', description: '', units: '', type: '', rent: '', deposit: '' });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo>({ mpesaPaybill: '', mpesaAccount: '', tillNumber: '', bankName: '', bankAccountName: '', bankAccount: '', rentAmount: 0, depositAmount: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [locationSuggestions, setLocationSuggestions] = useState<{ name: string; coords: { latitude: number; longitude: number } }[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    fetchPropertyById(propertyId).then((prop) => {
      if (!prop) { setLoadingProperty(false); return; }
      setForm({
        name: prop.name, location: prop.location, description: prop.description || '',
        units: String(prop.units), type: prop.type || '',
        rent: prop.paymentInfo?.rentAmount ? String(prop.paymentInfo.rentAmount) : '',
        deposit: prop.paymentInfo?.depositAmount ? String(prop.paymentInfo.depositAmount) : '',
      });
      setExistingImages(prop.images || []);
      if (prop.paymentInfo) setPayment(prop.paymentInfo);
      if (prop.latitude && prop.longitude) {
        setSelectedCoords({ latitude: prop.latitude, longitude: prop.longitude });
      }
      setLoadingProperty(false);
    });
  }, [propertyId]);

  useEffect(() => {
    return () => { newImages.forEach((img) => URL.revokeObjectURL(img.preview)); };
  }, [newImages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = (value: string) => {
    setForm({ ...form, location: value });
    setSelectedCoords(null);
    if (value.trim().length > 0) {
      const lower = value.toLowerCase().trim();
      const matches = Object.entries(NAIROBI_AREAS)
        .filter(([name]) => name.includes(lower) || lower.includes(name))
        .slice(0, 6)
        .map(([name, coords]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          coords,
        }));
      setLocationSuggestions(matches);
    } else {
      setLocationSuggestions([]);
    }
  };

  const selectLocationSuggestion = (name: string, coords: { latitude: number; longitude: number }) => {
    setForm({ ...form, location: name + ', Nairobi' });
    setSelectedCoords(coords);
    setLocationSuggestions([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ latitude, longitude });
        const matched = Object.entries(NAIROBI_AREAS)
          .sort(([, a], [, b]) => {
            const dA = Math.sqrt((a.latitude - latitude) ** 2 + (a.longitude - longitude) ** 2);
            const dB = Math.sqrt((b.latitude - latitude) ** 2 + (b.longitude - longitude) ** 2);
            return dA - dB;
          })[0];
        if (matched) {
          const areaName = matched[0].charAt(0).toUpperCase() + matched[0].slice(1);
          setForm({ ...form, location: areaName + ', Nairobi' });
        } else {
          setForm({ ...form, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        }
        setLocating(false);
        showToast('Location detected!', 'success');
      },
      () => {
        setLocating(false);
        showToast('Could not detect location. Please select from the list or type manually.', 'error');
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const valid: { file: File; preview: string }[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} exceeds 5MB limit`, 'error'); return; }
      valid.push({ file, preview: URL.createObjectURL(file) });
    });
    setNewImages((prev) => [...prev, ...valid].slice(0, 10 - existingImages.length));
  }, [showToast, existingImages.length]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => { URL.revokeObjectURL(prev[index].preview); return prev.filter((_, i) => i !== index); });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const keptExisting = existingImages;
    const uploadedUrls: string[] = [];

    if (newImages.length > 0) {
      for (const img of newImages) {
        const { url, error: uploadError } = await uploadPropertyImage(propertyId, img.file);
        if (url) uploadedUrls.push(url);
        if (uploadError) console.error('Image upload failed:', uploadError, img.file.name);
      }
    }

    const finalImages = [...keptExisting, ...uploadedUrls];

    const geo = selectedCoords || geocodeLocation(form.location);
    const { error: updateError } = await updateProperty(propertyId, {
      name: form.name,
      location: form.location,
      description: form.description,
      type: form.type || undefined,
      image: finalImages[0] || '',
      images: finalImages,
      payment_info: {
        ...payment,
        rentAmount: parseInt(form.rent) || payment.rentAmount || 0,
        depositAmount: parseInt(form.deposit) || payment.depositAmount || 0,
      },
      latitude: geo?.latitude,
      longitude: geo?.longitude,
    });

    if (updateError) {
      setSaving(false);
      setError(updateError);
      showToast(updateError, 'error');
      return;
    }

    setSaving(false);
    showToast('Property updated!', 'success');
    router.push(`/properties/${propertyId}`);
  };

  if (loadingProperty) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Property</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-error bg-error-container/30 p-3 rounded-xl">{error}</p>}

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Photos</label>

              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group rounded-lg overflow-hidden aspect-[4/3] bg-gray-100">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                        <X size={14} />
                      </button>
                      {i === 0 && <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</span>}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }} />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">Drag and drop, or{' '}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary font-semibold hover:underline">browse</button>
                  </p>
                  <p className="text-xs text-gray-400">Max 5MB each. {10 - existingImages.length - newImages.length} slots remaining.</p>
                </div>
              </div>

              {newImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {newImages.map((img, i) => (
                    <div key={`new-${i}`} className="relative group rounded-lg overflow-hidden aspect-[4/3] bg-gray-100">
                      <img src={img.preview} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button type="button" onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Azure Heights" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white">
                <option value="">Select type...</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div ref={locationRef} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => {
                        if (form.location.trim().length > 0) {
                          const lower = form.location.toLowerCase().trim();
                          const matches = Object.entries(NAIROBI_AREAS)
                            .filter(([name]) => name.includes(lower) || lower.includes(name))
                            .slice(0, 6)
                            .map(([name, coords]) => ({
                              name: name.charAt(0).toUpperCase() + name.slice(1),
                              coords,
                            }));
                          setLocationSuggestions(matches);
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. Westlands, Nairobi"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    title="Use my current location"
                  >
                    <Locate size={16} className={locating ? 'animate-spin' : 'text-primary'} />
                    <span className="hidden sm:inline">{locating ? 'Detecting...' : 'My Location'}</span>
                  </button>
                </div>
                {locationSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => selectLocationSuggestion(s.name, s.coords)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-primary/5 transition-colors"
                      >
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span>{s.name}, Nairobi</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCoords && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Coordinates: {selectedCoords.latitude.toFixed(4)}, {selectedCoords.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Property description..." rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rent per Unit (KES/month) <span className="text-red-500">*</span></label>
                <input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 35000" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (KES) <span className="text-red-500">*</span></label>
                <input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 35000" required min="0" />
              </div>
            </div>

            {user?.role === 'landlord' && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button type="button" onClick={() => setShowPayment(!showPayment)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-primary" />
                    <span className="font-medium text-sm text-gray-900">Payment Details</span>
                  </div>
                  {showPayment ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {showPayment && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">M-Pesa Paybill</label>
                        <input type="text" value={payment.mpesaPaybill} onChange={(e) => setPayment({ ...payment, mpesaPaybill: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">M-Pesa Account</label>
                        <input type="text" value={payment.mpesaAccount} onChange={(e) => setPayment({ ...payment, mpesaAccount: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Till Number</label>
                        <input type="text" value={payment.tillNumber} onChange={(e) => setPayment({ ...payment, tillNumber: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
                        <input type="text" value={payment.bankName} onChange={(e) => setPayment({ ...payment, bankName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bank Account Name</label>
                        <input type="text" value={payment.bankAccountName} onChange={(e) => setPayment({ ...payment, bankAccountName: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Bank Account Number</label>
                        <input type="text" value={payment.bankAccount} onChange={(e) => setPayment({ ...payment, bankAccount: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
