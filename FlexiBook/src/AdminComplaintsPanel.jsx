import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const AdminComplaintsPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // API Base URL & Token
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  const token = localStorage.getItem('token');

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle unauthorized/forbidden access
      if (response.status === 401 || response.status === 403) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Robust fallback extraction for backend payload variations
      let fetchedTickets = [];
      if (Array.isArray(data)) {
        fetchedTickets = data;
      } else if (Array.isArray(data.data)) {
        fetchedTickets = data.data;
      } else if (Array.isArray(data.complaints)) {
        fetchedTickets = data.complaints;
      }

      // Sort latest tickets to top
      const sortedTickets = [...fetchedTickets].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTickets(sortedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // 🔄 Polling fallback every 5 seconds for background sync
    const interval = setInterval(() => {
      fetchTickets();
    }, 5000);

    // ⚡ Socket.io real-time update listener
    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('master_dashboard:update', () => {
      fetchTickets();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    // Optimistic UI Update for instant responsiveness
    const previousTickets = [...tickets];
    setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));

    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Backend update failed");
      
      // Fetch fresh backend data to confirm state
      fetchTickets();
    } catch (error) {
      console.error("Error updating status:", error);
      setTickets(previousTickets); // Rollback optimistic update
      alert("Failed to update status. Please try again.");
    }
  };

  // 📊 Flexible Metric Calculations (Case-insensitive matching)
  const pendingCount = tickets.filter(t => 
    ['pending', 'Pending', 'open', 'Unresolved'].includes(t.status)
  ).length;
  
  const progressCount = tickets.filter(t => 
    ['in-progress', 'In Progress', 'in_progress'].includes(t.status)
  ).length;
  
  const resolvedCount = tickets.filter(t => 
    ['resolved', 'Resolved', 'closed', 'Closed'].includes(t.status)
  ).length;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <span className="text-5xl mb-4 block">🚫</span>
          <h2 className="text-xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm">
            You do not have the required Administrator privileges to view this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white p-2 rounded-lg">🛡️</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Central</h1>
          </div>
          <span className="bg-slate-100 text-slate-600 font-bold text-xs px-3 py-1.5 rounded-full border border-slate-200">
            Feedback Control Room
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 animate-fade-in">
        
        {/* STATS WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Tickets</p>
            <h3 className="text-3xl font-black text-slate-900">{tickets.length}</h3>
          </div>
          <div className="bg-linear-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-sm font-bold text-amber-700 mb-1">Pending Action</p>
            <h3 className="text-3xl font-black text-amber-900">{pendingCount}</h3>
          </div>
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-sm font-bold text-blue-700 mb-1">In Progress</p>
            <h3 className="text-3xl font-black text-blue-900">{progressCount}</h3>
          </div>
          <div className="bg-linear-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-sm font-bold text-emerald-700 mb-1">Resolved</p>
            <h3 className="text-3xl font-black text-emerald-900">{resolvedCount}</h3>
          </div>
        </div>

        {/* TICKETS DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-black text-slate-800 text-lg">Recent Patient Complaints</h2>
            <button 
              onClick={fetchTickets} 
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="p-4">Patient / Date</th>
                  <th className="p-4">Hospital Target</th>
                  <th className="p-4">Subject & Description</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                      <div className="flex justify-center items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading tickets...
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 font-medium italic">
                      No complaints found in the system. Everything is quiet!
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* 1. Patient Info */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-900 text-sm">
                          {ticket.userId?.name || 'Anonymous Patient'}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-1">
                          {ticket.createdAt 
                            ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </div>
                      </td>
                      
                      {/* 2. Hospital Target */}
                      <td className="p-4 align-top">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200">
                          🏥 {ticket.hospitalId?.name || 'General Platform'}
                        </span>
                      </td>

                      {/* 3. Issue Details */}
                      <td className="p-4 align-top max-w-md">
                        <div className="font-black text-slate-800 text-sm mb-1">{ticket.subject}</div>
                        <div className="text-sm text-slate-600 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          {ticket.description}
                        </div>
                      </td>

                      {/* 4. Status Badge */}
                      <td className="p-4 align-top text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-black rounded-md uppercase tracking-wide border shadow-sm ${
                          ['resolved', 'Resolved', 'closed', 'Closed'].includes(ticket.status)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          ['in-progress', 'In Progress', 'in_progress'].includes(ticket.status)
                            ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>

                      {/* 5. Action Dropdown */}
                      <td className="p-4 align-top text-center">
                        <select 
                          value={ticket.status ? ticket.status.toLowerCase() : 'pending'} 
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          className="bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 cursor-pointer shadow-sm hover:border-blue-400 transition-colors"
                        >
                          <option value="pending">🟡 Mark Pending</option>
                          <option value="in-progress">🔵 Mark In Progress</option>
                          <option value="resolved">🟢 Resolve Ticket</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintsPanel;