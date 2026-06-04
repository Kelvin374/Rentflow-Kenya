'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function PrintableDocument({ title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} — RentFlow Kenya</title>
          <style>
            @page { margin: 15mm; size: A4; }
            body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${ref.current?.innerHTML || ''}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer size={16} /> Print / Save PDF
        </Button>
      </div>
      <div ref={ref}>
        {children}
      </div>
    </div>
  );
}
