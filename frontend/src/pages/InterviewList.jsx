import { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

export default function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get('/interviews')
      .then(res => {
        const d = res.data.data || res.data || [];
        setInterviews(Array.isArray(d) ? d : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Interviews</h1>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState icon="📅" title="No interviews scheduled" description="When interviews are arranged, they will appear here." />
      ) : (
        <div className="space-y-3">
          {interviews.map(iv => (
            <Card key={iv.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">{iv.internship_title}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{iv.student_name} — {iv.student_email}</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-700">Scheduled:</span> {new Date(iv.scheduled_at).toLocaleString()}</p>
                    <p><span className="font-medium text-slate-700">Duration:</span> {iv.duration_minutes} min</p>
                    {iv.meeting_link && (
                      <p><span className="font-medium text-slate-700">Link:</span>{' '}
                        <a href={iv.meeting_link} className="text-primary-light hover:text-primary" target="_blank" rel="noopener noreferrer">{iv.meeting_link}</a>
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={iv.status}>{iv.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
