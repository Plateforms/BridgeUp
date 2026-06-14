import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

const statusOptions = ['', 'pending', 'reviewed', 'accepted', 'rejected'];

export default function ApplicationList() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get('/applications', { params: { status: statusFilter || undefined } })
      .then(res => {
        const d = res.data.data || res.data || [];
        setApplications(Array.isArray(d) ? d : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await client.put(`/applications/${id}/status`, { status });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {}
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {statusOptions.slice(1).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState icon="📋" title="No applications found" description={statusFilter ? 'No applications match the selected status.' : 'No applications have been submitted yet.'} />
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <Card key={app.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">{app.internship_title}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{app.student_name} — {app.student_email}</p>
                  {app.cover_letter && <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">{app.cover_letter}</p>}
                </div>
                <Badge variant={app.status}>{app.status}</Badge>
              </div>
              {user?.role === 'company' && app.status === 'pending' && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={() => handleStatusUpdate(app.id, 'reviewed')}>Mark Reviewed</Button>
                  <Button size="sm" variant="accent" onClick={() => handleStatusUpdate(app.id, 'accepted')}>Accept</Button>
                  <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(app.id, 'rejected')}>Reject</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
