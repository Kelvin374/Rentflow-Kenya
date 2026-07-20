'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { createProperty, updateProperty, uploadPropertyImage } from '@/lib/supabase-api';
import { ArrowLeft, Smartphone, ChevronDown, ChevronUp, Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/Toast';
import type { PaymentInfo } from '@/types';

const PROPERTY_TYPES = [
  'Bedsitter',
  'Studio',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4 Bedroom',
  '5 Bedroom',
  'Penthouse',
  'Townhouse',
  'Villa',
  'Maisonette',
  'Commercial',
  'Office Space',
  'Shop',
  'Warehouse',
];

const defaultPaymentInfo: PaymentInfo = {
  mpesaPaybill: '',
  mpesaAccount: '',
  tillNumber: '',
  bankName: '',
  bankAccountName: '',
  bankAccount: '',
};

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', location: '', description: '', units: '', type: '' });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo>(defaultPaymentInfo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const valid: { file: File; preview: string }[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} exceeds 5MB limit`, 'error');
        return;
      }
      valid.push({ file, preview: URL.createObjectURL(file) });
    });
    setImages((prev) => [...prev, ...valid].slice(0, 10));
  }, [showToast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { id: propId, error: createError } = await createProperty({
      name: form.name,
      location: form.location,
      description: form.description,
      type: form.type || undefined,
      units: parseInt(form.units),
      landlord_id: user?.id || '',
      payment_info: payment,
      images: [],
    });

    if (createError || !propId) {
      setSaving(false);
      setError(createError || 'Failed to create property');
      showToast(createError || 'Failed to create property', 'error');
      return;
    }

    if (images.length > 0) {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      for (const img of images) {
        const { url, error: uploadError } = await uploadPropertyImage(propId, img.file);
        if (url) uploadedUrls.push(url);
        if (uploadError) console.warn('Image upload failed:', uploadError);
      }
      setUploadingImages(false);

      if (uploadedUrls.length > 0) {
        await updateProperty(propId, {
          image: uploadedUrls[0],
          images: uploadedUrls,
        });
      }
    }

    setSaving(false);
    showToast('Property created successfully!', 'success');
    router.push('/properties');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add New Property</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-error bg-error-container/30 p-3 rounded-xl">{error}</p>}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Photos</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Drag and drop photos here, or{' '}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary font-semibold hover:underline">
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-400">JPEG, PNG, WebP or GIF. Max 5MB each. Up to 10 photos.</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-[4/3] bg-gray-100">
                      <img src={img.preview} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      >
                        <X size={14} />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
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
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Westlands, Nairobi" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Property description..." rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units</label>
              <input type="number" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. 24" required min="1" />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setShowPayment(!showPayment)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-primary" />
                  <span className="font-medium text-sm text-gray-900">Payment Details</span>
                </div>
                {showPayment ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>
              {showPayment && (
                <div className="p-4 space-y-4">
                  <p className="text-xs text-gray-500">Configure how tenants pay rent for this property.</p>
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

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? (uploadingImages ? 'Uploading photos...' : 'Saving...') : 'Create Property'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
