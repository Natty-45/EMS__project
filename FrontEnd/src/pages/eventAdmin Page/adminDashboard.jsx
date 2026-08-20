import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { UsersIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'superAdmin' && currentUser.role !== 'Admin')) {
      toast.error('Access denied');
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

  return (
    <div className={`min-h-screen ${theme.background} pt-20 px-4`}>
      <div className="max-w-6xl mx-auto mt-10 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            <h2 className={`text-3xl font-bold ${theme.text}`}>User Management</h2>
          </div>
          <span className={`text-sm ${theme.textSecondary}`}>{users.length} users</span>
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading users...</p>
        ) : (
          <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-4 text-left text-sm font-semibold">User</th>
                  <th className="p-4 text-left text-sm font-semibold">Email</th>
                  <th className="p-4 text-left text-sm font-semibold">Role</th>
                  <th className="p-4 text-left text-sm font-semibold">Verified</th>
                  <th className="p-4 text-left text-sm font-semibold">Joined</th>
                  <th className="p-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilepic || 'https://cdn.vectorstock.com/i/1000v/23/81/default-avatar-profile-icon-vector-18942381.avif'}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="text-sm font-medium">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="text-sm p-1 rounded border border-gray-300 bg-white dark:bg-gray-700"
                        disabled={user._id === currentUser?._id}
                      >
                        <option value="user">user</option>
                        <option value="Admin">Admin</option>
                        <option value="superAdmin">superAdmin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {user._id !== currentUser?._id && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-500 hover:text-red-700 transition"
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
    </div>
  );
};

export default AdminDashboard;
