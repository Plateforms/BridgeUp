import { useState, useEffect } from 'react';
import client from '../api/client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadStats = () => {
    setLoadingStats(true);
    client.get('/admin/stats').then(res => setStats(res.data)).catch(() => {}).finally(() => setLoadingStats(false));
  };
  const loadUsers = () => {
    setLoadingUsers(true);
    client.get('/admin/users', { params: { role: roleFilter || undefined } })
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => { loadStats(); loadUsers(); }, [roleFilter]);

  const handleRoleChange = async (userId, role) => {
    try {
      await client.put(`/admin/users/${userId}/role`, { role });
      loadUsers();
    } catch {}
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/users/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadUsers();
      loadStats();
    } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      {loadingStats ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <StatCard label="Users" value={stats.users} />
          <StatCard label="Internships" value={stats.internships} />
          <StatCard label="Applications" value={stats.applications} />
          <StatCard label="Interviews" value={stats.interviews} />
          <StatCard label="Ratings" value={stats.ratings} />
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loadingUsers ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{u.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                    <td className="py-3 pr-4"><Badge variant={u.role}>{u.role}</Badge></td>
                    <td className="py-3 flex gap-2">
                      <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(u)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User">
        <p className="text-sm text-slate-600 mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
      <p className="text-2xl sm:text-3xl font-bold text-primary">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
