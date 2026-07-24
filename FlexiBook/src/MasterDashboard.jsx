import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from './services/api'; // Or your custom axios instance
import AdminComplaintsPanel from './AdminComplaintsPanel';

// Dynamically use process.env for socket connection in production (e.g. Render), defaulting to localhost
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const socket = io(SOCKET_URL);

const MasterDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalHospitals: 0, 
    totalBookings: 0, 
    openComplaints: 0 
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Step 3: Fetch updated stats from the newly created auth route
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live metrics from /api/auth/admin-stats
      const statsRes = await api.get('/auth/admin-stats');
      
      // 2. Fetch users list
      let usersData = [];
      try {
        const usersRes = await api.get('/users/all');
        const raw = usersRes.data?.data || usersRes.data || [];
        usersData = Array.isArray(raw) ? raw : [];
      } catch (userErr) {
        console.warn('Could not load detailed user list:', userErr);
        try {
          const fallbackRes = await api.get('/users');
          const raw = fallbackRes.data?.data || fallbackRes.data || [];
          usersData = Array.isArray(raw) ? raw : [];
        } catch (e) {}
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
    fetchDashboardData();

    // Socket.io real-time listener for ongoing platform activities
    socket.on('master_dashboard:update', () => {
      fetchDashboardData();
    });

    return () => socket.off('master_dashboard:update');
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch('/admin/update-role', { userId, role: newRole });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Controls */}
      <aside style={{ width: '250px', background: '#0f172a', color: '#fff', padding: '20px' }}>
        <h2>FlexiBook</h2>
        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Admin Control</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button onClick={() => setActiveTab('overview')}>📊 Platform Overview</button>
          <button onClick={() => setActiveTab('users')}>👥 Manage Users</button>
          <button onClick={() => setActiveTab('complaints')}>🚨 Platform Complaints</button>
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

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px' }}>
                <h3>Total Users</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
              </div>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px' }}>
                <h3>Hospitals / Clinics</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalHospitals}</p>
              </div>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px' }}>
                <h3>Total Bookings</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalBookings}</p>
              </div>
              <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '180px' }}>
                <h3>Open Complaints</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>{stats.openComplaints}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1>User Management</h1>
            <table width="100%" cellPadding="10" style={{ background: '#fff', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="business">Business</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>-</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>
                      No registered users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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