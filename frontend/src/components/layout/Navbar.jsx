import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const links = [
  { to: '/internships', label: 'Internships', roles: ['student', 'company', 'admin'] },
  { to: '/applications', label: 'Applications', roles: ['student', 'company', 'admin'] },
  { to: '/interviews', label: 'Interviews', roles: ['student', 'company', 'admin'] },
  { to: '/companies', label: 'Companies', roles: ['student', 'company', 'admin'] },
  { to: '/internships/create', label: 'Post', roles: ['company', 'admin'] },
  { to: '/admin', label: 'Admin', roles: ['admin'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const visible = links.filter(l => user && l.roles.includes(user.role));

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-[72rem] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="text-xl" role="img" aria-hidden="true">&#x1F393;</span>
            InternHub
          </Link>

          {user && (
            <>
              <div className="hidden md:flex items-center gap-1">
                {visible.map(l => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === l.to ? 'bg-primary-subtle text-primary' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  {user.name}
                  <span className="ml-1 text-xs text-slate-400">({user.role})</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
              </div>

              <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 cursor-pointer" onClick={() => setOpen(!open)} aria-label="Toggle menu">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </>
          )}
        </div>

        {open && user && (
          <div className="md:hidden pb-4 border-t border-slate-100 pt-2 space-y-1">
            {visible.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === l.to ? 'bg-primary-subtle text-primary' : 'text-slate-600 hover:bg-slate-100'}`}>
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 mt-2">
              <span className="block px-3 py-1 text-sm text-slate-500">{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
