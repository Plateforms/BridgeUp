import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function CompanyProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      client.get(`/companies/${id}`).then(r => setCompany(r.data)).catch(() => {}),
      client.get(`/companies/${id}/ratings`).then(r => setRatings(Array.isArray(r.data) ? r.data : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/companies/${id}/ratings`, { rating, review });
      setMessage('Rating submitted!');
      setReview('');
      const res = await client.get(`/companies/${id}/ratings`);
      setRatings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto space-y-4">{<Skeleton className="h-32 w-full" />}{<Skeleton className="h-48 w-full" />}</div>;
  if (!company) return <div className="text-center py-16 text-slate-500">Company not found.</div>;

  const renderStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
        <p className="text-slate-500">{company.company_name || company.email}</p>
        {company.avg_rating && (
          <p className="mt-2 text-lg text-amber-500" aria-label={`Rating: ${company.avg_rating} out of 5`}>
            {renderStars(Math.round(company.avg_rating))} <span className="text-sm text-slate-400">({company.avg_rating})</span>
          </p>
        )}
        {company.rating_count !== undefined && (
          <p className="text-sm text-slate-400">{company.rating_count} review{company.rating_count !== 1 ? 's' : ''}</p>
        )}
      </Card>

      {user?.role === 'student' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Rate this Company</h2>
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${message.includes('submitted') ? 'bg-accent-light text-accent border-accent/20' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-2xl transition-colors cursor-pointer ${n <= rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`}
                  aria-label={`${n} star${n !== 1 ? 's' : ''}`}>
                  ★
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Review <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button type="submit" variant="accent">Submit Rating</Button>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Reviews ({ratings.length})</h2>
        {ratings.length === 0 ? (
          <EmptyState icon="💬" title="No reviews yet" description="Be the first to share your experience." />
        ) : (
          <div className="space-y-4">
            {ratings.map(r => (
              <div key={r.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <p className="text-amber-400 text-lg">{renderStars(r.rating)}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.student_name}</p>
                {r.review && <p className="text-sm text-slate-600 mt-2">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
