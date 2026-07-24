import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from './services/api'; // Or your custom axios instance
import AdminComplaintsPanel from './AdminComplaintsPanel';

// Dynamically use process.env for socket connection in production (e.g. Render), defaulting to localhost
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const socket = io(SOCKET_URL);

const MasterDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [roleCategoryFilter, setRoleCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalHospitals: 0, 
    totalBookings: 0, 
    openComplaints: 0 
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch live metrics and user list from the backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all live metrics from /auth/admin-stats
      const statsRes = await api.get('/auth/admin-stats');
      
      // 2. Fetch users list directly from /auth/users
      let usersData = [];
      try {
        const usersRes = await api.get('/auth/users');
        usersData = usersRes.data || [];
      } catch (userErr) {
        console.warn('Could not load detailed user list:', userErr);
      }

      if (statsRes.data) {
        setStats({
          totalUsers: statsRes.data.totalUsers || 0,
          totalHospitals: statsRes.data.totalHospitals || 0,
          totalBookings: statsRes.data.totalBookings || 0,
          openComplaints: statsRes.data.openComplaints || 0
        });
      }
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading Master Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial fetch on component mount
    fetchDashboardData();

    // 2. Auto-polling: Refresh all metrics automatically every 5 seconds
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    // 3. Socket.io real-time listener for instant server triggers
    socket.on('master_dashboard:update', () => {
      fetchDashboardData();
    });

    // Cleanup interval and socket listeners on component unmount
    return () => {
      clearInterval(pollInterval);
      socket.off('master_dashboard:update');
    };
  }, []);

  // Update role operation
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch('/auth/update-role', { userId, role: newRole });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  // Delete user operation
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user account: "${userName}"?`)) {
      try {
        await api.delete(`/auth/users/${userId}`);
        fetchDashboardData();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  // Dynamic filter for tab categories and search bar query
  const filteredUsers = users.filter(u => {
    const matchesCategory = roleCategoryFilter === 'all' || u.role === roleCategoryFilter;
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Controls */}
      <aside style={{ width: '250px', background: '#0f172a', color: '#fff', padding: '20px' }}>
        <h2>FlexiBook</h2>
        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Admin Control</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ 
              padding: '10px', 
              backgroundColor: activeTab === 'overview' ? '#2563eb' : 'transparent', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              textAlign: 'left', 
              cursor: 'pointer' 
            }}
          >
            📊 Platform Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              padding: '10px', 
              backgroundColor: activeTab === 'users' ? '#2563eb' : 'transparent', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              textAlign: 'left', 
              cursor: 'pointer' 
            }}
          >
            👥 Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('complaints')}
            style={{ 
              padding: '10px', 
              backgroundColor: activeTab === 'complaints' ? '#2563eb' : 'transparent', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              textAlign: 'left', 
              cursor: 'pointer' 
            }}
          >
            🚨 Platform Complaints
          </button>
        </div>
      </aside>

      {/* Main Control Center */}
      <main style={{ flex: 1, padding: '30px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Admin Control Panel</h1>
          <button 
            onClick={fetchDashboardData} 
            disabled={loading}
            style={{ 
              padding: '10px 16px', 
              backgroundColor: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Panel'}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>Total Users</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
              </div>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>Hospitals / Clinics</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalHospitals}</p>
              </div>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>Total Bookings</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalBookings}</p>
              </div>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>Open Complaints</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{stats.openComplaints}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div>
            <h2>User Management Center</h2>

            {/* Category Filter Tabs & Live Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'All Users', key: 'all' },
                  { label: 'Patients', key: 'patient' },
                  { label: 'Doctors', key: 'doctor' },
                  { label: 'Businesses / Clinics', key: 'business' },
                  { label: 'Admins', key: 'admin' },
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setRoleCategoryFilter(cat.key)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: roleCategoryFilter === cat.key ? '#0f172a' : '#fff',
                      color: roleCategoryFilter === cat.key ? '#fff' : '#334155',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="🔍 Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  width: '250px'
                }}
              />
            </div>

            {/* Dynamic User Table */}
            <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table width="100%" cellPadding="12" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <th>Name / Business</th>
                    <th>Email</th>
                    <th>Category Role</th>
                    <th>Mobile</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td>
                          <strong>{u.name}</strong>
                          {u.businessName && <div style={{ fontSize: '12px', color: '#64748b' }}>{u.businessName}</div>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <select 
                            value={u.role || 'patient'} 
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="business">Business / Clinic</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{u.mobile || u.phone || 'N/A'}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        No registered users found matching this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div>
            <h1>Platform Complaints Management</h1>
            <AdminComplaintsPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default MasterDashboard;