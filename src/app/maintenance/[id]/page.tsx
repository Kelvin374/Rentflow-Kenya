'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { fetchMaintenanceById, updateMaintenanceRequest } from '@/lib/supabase-api';

const statusFlow = ['submitted', 'assigned', 'in_progress', 'completed'];

export default function MaintenanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState('submitted');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMaintenanceById(params.id as string).then((data) => {
      if (data) {
        setTicket(data);
        setCurrentStatus(data.status);
      }
      setLoading(false);
    });
  }, [params.id]);

  const advanceStatus = async () => {
    const idx = statusFlow.indexOf(currentStatus);
    if (idx >= statusFlow.length - 1 || currentStatus === 'completed') return;
    const nextStatus = statusFlow[idx + 1];
    setSaving(true);
    await updateMaintenanceRequest(params.id as string, { status: nextStatus });
    setCurrentStatus(nextStatus);
    setTicket((prev: any) => ({ ...prev, status: nextStatus }));
    setSaving(false);
  };

  const regressStatus = async () => {
    const idx = statusFlow.indexOf(currentStatus);
    if (idx <= 0) return;
    const prevStatus = statusFlow[idx - 1];
    setSaving(true);
    await updateMaintenanceRequest(params.id as string, { status: prevStatus });
    setCurrentStatus(prevStatus);
    setTicket((prev: any) => ({ ...prev, status: prevStatus }));
    setSaving(false);
  };

  if (loading) {
    return <div className="p-6 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  if (!ticket) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Maintenance request not found</p>
        <Button onClick={() => router.push('/maintenance')} className="mt-4">Back to Maintenance</Button>
      </div>
    );
  }

  const currentIdx = statusFlow.indexOf(currentStatus);
  const canProgress = currentIdx < statusFlow.length - 1 && currentStatus !== 'completed';
  const canRegress = currentIdx > 0;

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/maintenance')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Maintenance Request</h1>
            <p className="text-sm text-gray-500">Ticket #{ticket.id.toUpperCase()} &middot; {ticket.propertyName}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{ticket.description}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Unit {ticket.unitNumber}</span>
                      <span>&middot;</span>
                      <span className="capitalize">{ticket.category.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                    {currentStatus === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {currentStatus.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><User size={14} /> {ticket.tenantName}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60))}h ago</span>
                </div>

                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getStatusColor(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>

                {ticket.assignedTo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Assigned to</p>
                    <p className="text-sm font-medium text-gray-900">{ticket.assignedTo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="flex items-center gap-2 mb-4">
                  {statusFlow.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        statusFlow.indexOf(currentStatus) >= i
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                      {i < statusFlow.length - 1 && (
                        <div className={`flex-1 h-0.5 ${statusFlow.indexOf(currentStatus) > i ? 'bg-primary' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center capitalize">
                  Current: {currentStatus.replace(/_/g, ' ')}
                </p>
              </CardContent>
            </Card>

            {ticket.progress !== undefined && currentStatus === 'in_progress' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Completion Progress</h3>
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>{ticket.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${ticket.progress}%` }} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  {canProgress && (
                    <Button className="w-full" onClick={advanceStatus} disabled={saving}>
                      {saving ? 'Updating...' :
                       currentStatus === 'submitted' ? 'Assign Ticket' :
                       currentStatus === 'assigned' ? 'Start Work' :
                       'Mark Completed'}
                    </Button>
                  )}
                  {currentStatus === 'completed' ? (
                    <div className="p-3 bg-success/10 rounded-lg text-center">
                      <p className="text-sm font-medium text-success">Completed</p>
                      {ticket.completedAt && <p className="text-xs text-gray-400">{new Date(ticket.completedAt).toLocaleDateString()}</p>}
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={regressStatus} disabled={!canRegress || saving}>
                      Move Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Cost Summary</h3>
                <p className="text-2xl font-bold text-gray-900">{ticket.cost ? formatCurrency(ticket.cost) : '—'}</p>
                <p className="text-xs text-gray-400 mt-1">{ticket.cost ? 'Estimated cost' : 'Cost not yet recorded'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
