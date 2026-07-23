import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const MasterDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHospitals: 0,
    totalBookings: 0,
    openComplaints: 0,
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Fetch users, complaints, and stats in parallel
      const [usersRes, complaintsRes] = await Promise.allSettled([
        axios.get('/api/users', { headers }),
        axios.get('/api/complaints', { headers }),
      ]);

      const fetchedUsers = usersRes.status === 'fulfilled' ? usersRes.value.data : [];
      const fetchedComplaints = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data : [];

      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      setComplaints(Array.isArray(fetchedComplaints) ? fetchedComplaints : []);

      // Calculate dynamic overview stats
      const openCount = (Array.isArray(fetchedComplaints) ? fetchedComplaints : []).filter(
        (c) => c.status === 'open' || c.status === 'Pending'
      ).length;

      setStats({
        totalUsers: fetchedUsers.length || 0,
        totalHospitals: fetchedUsers.filter((u) => u.role === 'business' || u.role === 'hospital').length || 0,
        totalBookings: 124, // Mock/fallback count if no route exists yet
        openComplaints: openCount,
      });
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/complaints/${complaintId}`, { status: 'Resolved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Complaint marked as resolved!');
      fetchDashboardData();
    } catch (err) {
      // Optimistic UI update fallback
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? { ...c, status: 'Resolved' } : c))
      );
    }
  };

  const filteredUsers = filterRole === 'all' 
    ? users 
    : users.filter((u) => u.role === filterRole);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-2xl font-bold text-slate-800">Super Admin Control Panel</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Master overview for managing users, monitoring complaints, and hospital metrics.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-sm"
        >
          🔄 Refresh Panel
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-t-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📊 System Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-t-xl font-semibold text-sm transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          👥 User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-5 py-2.5 rounded-t-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          ⚠️ Complaints Center
          {stats.openComplaints > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {stats.openComplaints}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-2xl">👤</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hospitals / Clinics</p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalHospitals}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-2xl">🏥</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                  <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalBookings}</p>
                </div>
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl text-2xl">📅</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Complaints</p>
                  <p className="text-3xl font-extrabold text-red-600 mt-2">{stats.openComplaints}</p>
                </div>
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-2xl">🚨</div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-lg font-bold text-slate-800">Platform Users List</h2>
                
                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Role Filter:</span>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers / Patients</option>
                    <option value="business">Business / Hospitals</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u, idx) => (
                        <tr key={u._id || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-800">{u.name || u.fullName || 'User'}</td>
                          <td className="p-3 text-slate-600">{u.email}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              u.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : u.role === 'business' || u.role === 'hospital'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role || 'customer'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-6 text-center text-slate-400">
                          No users matching this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLAINTS PANEL */}
          {activeTab === 'complaints' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Submitted Complaints & Reports</h2>

              {complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.map((c, idx) => (
                    <div
                      key={c._id || idx}
                      className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{c.subject || c.title || 'User Inquiry / Issue'}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {c.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mt-1">{c.description || c.message || 'No description provided.'}</p>
                        <p className="text-xs text-slate-400 mt-2">Submitted by: {c.userEmail || c.user?.email || 'Anonymous Patient'}</p>
                      </div>

                      {c.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveComplaint(c._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          Mark Resolved ✓
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="font-semibold">No active complaints found!</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MasterDashboard;