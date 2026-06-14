import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function InternshipCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/internships', form);
      navigate(`/internships/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create internship');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'company' && user?.role !== 'admin') {
    return <div className="text-center py-16 text-red-600 font-medium">Access denied. Company or admin only.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Post a New Internship</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4" role="alert">{error}</div>}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Title" name="title" placeholder="e.g. Software Engineer Intern" value={form.title} onChange={handleChange} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea name="description" placeholder="Describe the role and responsibilities…" value={form.description} onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Requirements <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea name="requirements" placeholder="List the required skills and qualifications…" value={form.requirements} onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Input label="Location" name="location" placeholder="e.g. Remote, New York, San Francisco" value={form.location} onChange={handleChange} />
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? 'Posting…' : 'Post Internship'}</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
