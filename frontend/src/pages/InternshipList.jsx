import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get('/internships', { params: { q: search || undefined, page, limit: 12 } })
      .then(res => {
        setInternships(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Internships</h1>
        <div className="w-full sm:w-72">
          <Input placeholder="Search by title or description…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : internships.length === 0 ? (
        <EmptyState icon="🔍" title="No internships found" description={search ? 'Try a different search term.' : 'No internships are currently available. Check back later.'} />
      ) : (
        <>
          <div className="grid gap-4">
            {internships.map(internship => (
              <Link key={internship.id} to={`/internships/${internship.id}`} className="block">
                <Card hover className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-slate-900 truncate">{internship.title}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {internship.company_name} — {internship.location || 'Remote'}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{internship.description}</p>
                    </div>
                    <span className="shrink-0 text-slate-300 mt-1">&rarr;</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
