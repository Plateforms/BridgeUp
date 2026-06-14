import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get('/companies')
      .then(res => setCompanies(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating) => {
    const r = Math.round(rating);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Companies</h1>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon="🏢" title="No companies found" description="No companies are registered on the platform yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {companies.map(c => (
            <Link key={c.id} to={`/companies/${c.id}`}>
              <Card hover className="p-5">
                <h2 className="font-semibold text-slate-900">{c.name}</h2>
                <p className="text-sm text-slate-500">{c.email}</p>
                {c.avg_rating && (
                  <p className="mt-2 text-sm text-amber-500" aria-label={`Rating: ${c.avg_rating} out of 5`}>
                    {renderStars(c.avg_rating)} <span className="text-slate-400 ml-1">({c.avg_rating})</span>
                  </p>
                )}
                {c.rating_count !== undefined && (
                  <p className="text-xs text-slate-400 mt-1">{c.rating_count} review{c.rating_count !== 1 ? 's' : ''}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
