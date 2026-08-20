import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Reveal from '../../components/ui/Reveal';
import GradientText from '../../components/ui/GradientText';
import { UsersIcon, TrashIcon, CheckCircleIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const ROLE_BADGE = {
  user: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
  Admin: 'bg-green-500/10 text-green-600 dark:text-green-400',
  superAdmin: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

const AdminDashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admins: 0, verified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'superAdmin') {
      toast.error('Access denied. Super Admin only.');
      navigate('/');
      return;
    }
    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data);
      setStats({
        total: data.length,
        admins: data.filter(u => u.role === 'Admin' || u.role === 'superAdmin').length,
        verified: data.filter(u => u.isVerified).length,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      toast.success('Role updated successfully');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user/${userId}/admin-delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: <UserGroupIcon className="h-6 w-6 text-brand-500" /> },
    { label: 'Admins', value: stats.admins, icon: <ShieldCheckIcon className="h-6 w-6 text-green-500" /> },
    { label: 'Verified Users', value: stats.verified, icon: <CheckCircleIcon className="h-6 w-6 text-emerald-500" /> },
  ];

  return (
    <div className={`min-h-screen ${theme.background} pt-28`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden">
        <div className="h-72 w-72 rounded-full bg-purple-500/15 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400">
              <ShieldCheckIcon className="h-4 w-4" />
              Super Admin
            </span>
            <h1 className={`mt-4 font-display text-3xl font-bold sm:text-4xl ${theme.text}`}>
              User <GradientText>Management</GradientText>
            </h1>
            <p className={`mt-2 ${theme.textSecondary}`}>
              Manage all users, assign roles and keep the platform healthy.
            </p>
          </div>
        </Reveal>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className={`group relative overflow-hidden rounded-3xl ${theme.card} border ${theme.border} p-6 card-hover`}>
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  {stat.icon}
                </span>
                <div className={`mt-4 font-display text-3xl font-bold ${theme.text}`}>{stat.value}</div>
                <p className={`mt-1 text-sm ${theme.textSecondary}`}>{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className={`overflow-hidden rounded-3xl ${theme.card} border ${theme.border} shadow-lg shadow-black/5`}>
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="flex items-center gap-3 rounded-full bg-brand-500/10 px-6 py-3 text-brand-600 dark:text-brand-400">
                  <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
                  Loading users...
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-slate-50/60 dark:border-white/10 dark:bg-white/5">
                      {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-brand-500/5 dark:border-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.profilepic || 'https://cdn.vectorstock.com/i/1000v/23/81/default-avatar-profile-icon-vector-18942381.avif'}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/20"
                            />
                            <span className={`text-sm font-semibold ${theme.text}`}>{user.fullName}</span>
                          </div>
                        </td>
                        <td className={`p-4 text-sm ${theme.textSecondary}`}>{user.email}</td>
                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`cursor-pointer rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold outline-none transition-colors focus:border-brand-500 dark:border-white/10 ${theme.card} ${theme.text}`}
                            disabled={user._id === currentUser?._id}
                          >
                            <option value="user">user</option>
                            <option value="Admin">Admin</option>
                            <option value="superAdmin">superAdmin</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${user.isVerified ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {user.isVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className={`p-4 text-sm ${theme.textSecondary}`}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {user._id !== currentUser?._id && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="rounded-xl p-2 text-red-500 transition-all duration-200 hover:scale-110 hover:bg-red-500/10"
                              title="Delete user"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AdminDashboard;