import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from './services/api'; // Or your custom axios instance
import AdminComplaintsPanel from './AdminComplaintsPanel';

const socket = io('http://localhost:3000'); // Your server socket URL

const MasterDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalAppointments: 0, pendingComplaints: 0 });
  const [users, setUsers] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      const usersRes = await api.get('/users'); // Uses existing userRoute
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading Master Dashboard:', err);
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
        <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Super Admin Control</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button onClick={() => setActiveTab('overview')}>📊 Platform Overview</button>
          <button onClick={() => setActiveTab('users')}>👥 Manage Users</button>
          <button onClick={() => setActiveTab('complaints')}>🚨 Platform Complaints</button>
        </div>
      </aside>

      {/* Main Control Center */}
      <main style={{ flex: 1, padding: '30px', background: '#f8fafc' }}>
        {activeTab === 'overview' && (
          <div>
            <h1>Master Platform Overview</h1>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="card"><h3>Total Users</h3><p>{stats.totalUsers}</p></div>
              <div className="card"><h3>Total Appointments</h3><p>{stats.totalAppointments}</p></div>
              <div className="card"><h3>Pending Complaints</h3><p>{stats.pendingComplaints}</p></div>
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
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="business">Business</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Superadmin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div>
            <h1>Platform Complaints Management</h1>
            {/* Embedded existing AdminComplaintsPanel component */}
            <AdminComplaintsPanel />
          </div>
        )}
      </main>
    </div>
  );
};

export default MasterDashboard;