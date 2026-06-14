import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <span className="text-3xl" role="img" aria-hidden="true">&#x1F393;</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-slate-500">
          Don't have an account? <Link to="/register" className="text-primary-light font-medium hover:text-primary">Register</Link>
        </p>
      </Card>
    </div>
  );
}
