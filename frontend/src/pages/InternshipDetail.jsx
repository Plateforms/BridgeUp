import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

export default function InternshipDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    client.get(`/internships/${id}`)
      .then(res => setInternship(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await client.post('/applications', { internshipId: parseInt(id), coverLetter });
      setMessage('Application submitted successfully!');
      setApplying(false);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Application failed');
    }
  };

  if (loading) return <div className="space-y-4">{<Skeleton className="h-8 w-64" />}{<Skeleton className="h-4 w-48" />}{<Skeleton className="h-32 w-full" />}</div>;
  if (!internship) return <div className="text-center py-16 text-slate-500">Internship not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-900 mb-4 flex items-center gap-1 transition-colors cursor-pointer">
        &larr; Back
      </button>

      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{internship.title}</h1>
        <p className="text-slate-500 mt-1">{internship.company_name} — {internship.location || 'Remote'}</p>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{internship.description}</p>
          </div>

          {internship.requirements && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Requirements</h3>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{internship.requirements}</p>
            </div>
          )}
        </div>

        {message && (
          <div className={`mt-6 px-4 py-3 rounded-lg text-sm border ${message.includes('success') ? 'bg-accent-light text-accent border-accent/20' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100">
          {user?.role === 'student' && !applying && !message && (
            <Button onClick={() => setApplying(true)}>Apply Now</Button>
          )}

          {applying && (
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Cover Letter</label>
                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Tell the company why you're a great fit…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="accent">Submit Application</Button>
                <Button variant="secondary" onClick={() => setApplying(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
