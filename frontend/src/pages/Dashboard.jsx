import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const cards = [
  { to: '/internships', title: 'Browse Internships', desc: 'Find and apply to internship opportunities', icon: '\uD83D\uDD0D', roles: ['student', 'company', 'admin'] },
  { to: '/applications', title: 'My Applications', desc: 'Track your application status', icon: '\uD83D\uDCCB', roles: ['student', 'company', 'admin'] },
  { to: '/interviews', title: 'Interviews', desc: 'View scheduled interviews', icon: '\uD83C\uDF93', roles: ['student', 'company', 'admin'] },
  { to: '/companies', title: 'Companies', desc: 'Browse companies and ratings', icon: '\uD83C\uDFED', roles: ['student', 'company', 'admin'] },
  { to: '/internships/create', title: 'Post Internship', desc: 'Create a new listing', icon: '\u2795', roles: ['company', 'admin'] },
  { to: '/admin', title: 'Admin Panel', desc: 'Manage users and view stats', icon: '\uD83D\uDD12', roles: ['admin'] },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome, {user?.name}</h1>
        <p className="text-slate-500 mt-1">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.filter(c => c.roles.includes(user?.role)).map(c => (
          <Link
            key={c.to}
            to={c.to}
            className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <span className="text-2xl block mb-3" role="img" aria-hidden="true">{c.icon}</span>
            <h2 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{c.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
