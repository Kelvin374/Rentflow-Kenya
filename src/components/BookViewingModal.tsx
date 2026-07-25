'use client';

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
  if (!isOpen || !property) return null;

  const hasContact = !!(property.contactPhone || property.contactEmail);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${property.images?.[0] || property.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
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
          <div className="text-center mb-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">visibility</span>
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-2">Schedule a Viewing</h4>
            <p className="text-sm text-on-surface-variant">
              {hasContact
                ? 'Contact the property manager below to arrange a visit.'
                : 'No contact information available for this property yet. Please check back later.'}
            </p>
          </div>

          {hasContact && (
            <div className="space-y-3 mb-6">
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
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-95 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
