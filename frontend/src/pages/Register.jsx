import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'student', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <span className="text-3xl" role="img" aria-hidden="true">&#x1F393;</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Create account</h1>
          <p className="text-sm text-slate-500 mt-1">Join the internship platform</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">I am a</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="student">Student</option>
              <option value="company">Company</option>
            </select>
          </div>
          {form.role === 'company' && (
            <Input label="Company name" name="companyName" placeholder="Acme Inc." value={form.companyName} onChange={handleChange} required />
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-primary-light font-medium hover:text-primary">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
