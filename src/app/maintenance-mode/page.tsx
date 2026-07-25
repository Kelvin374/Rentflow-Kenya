import { Wrench } from 'lucide-react';

export const metadata = {
  title: 'Maintenance Mode | RentFlow Kenya',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-on-background">
            Under Maintenance
          </h1>
          <p className="text-lg text-on-surface-variant">
            We&apos;re currently performing scheduled maintenance to improve your
            experience. Please check back later.
          </p>
        </div>

        <div className="pt-4 border-t border-outline-variant">
          <p className="text-sm text-outline">
            RentFlow Kenya &mdash; Smart Property Management
          </p>
        </div>
      </div>
    </div>
  );
}
