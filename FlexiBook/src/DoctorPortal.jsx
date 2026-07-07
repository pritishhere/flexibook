import { useState, useEffect } from 'react';

const DoctorPortal = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [currentToken, setCurrentToken] = useState(1);
  
  // Leave form state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Fetch all doctors in system to simulate selecting the logged-in doctor
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/doctors');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setDoctors(json.data);
          setSelectedDoctorId(json.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err.message);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch mock appointments for doctor simulation
  useEffect(() => {
    if (!selectedDoctorId) return;
    
    // Simulate real-time patient queue appointments list
    const mockAppointments = [
      { id: '1', patientName: 'John Doe', token: 1, time: '09:30 AM', reason: 'Routine Heart checkup', status: 'In Waiting' },
      { id: '2', patientName: 'Jane Smith', token: 2, time: '10:00 AM', reason: 'Fever symptom analysis', status: 'In Waiting' },
      { id: '3', patientName: 'Robert Johnson', token: 3, time: '10:30 AM', reason: 'Joint fracture follow-up', status: 'In Waiting' },
      { id: '4', patientName: 'Sarah Williams', token: 4, time: '11:00 AM', reason: 'Skin allergy rash review', status: 'In Waiting' }
    ];
    setAppointments(mockAppointments);
    setCurrentToken(1);
  }, [selectedDoctorId]);

  const handleCallNext = () => {
    if (currentToken < appointments.length) {
      setCurrentToken(prev => prev + 1);
      setAlert({ type: 'success', message: `Patient token #${currentToken + 1} has been called to consultation room!` });
    } else {
      setAlert({ type: 'success', message: 'All scheduled patients checked for today!' });
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!selectedDoctorId) {
      setAlert({ type: 'error', message: 'No doctor profile selected!' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        doctorId: selectedDoctorId,
        date: leaveDate,
        reason: leaveReason
      };

      const res = await fetch(`http://localhost:3000/api/doctors/${selectedDoctorId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        setAlert({ 
          type: 'success', 
          message: `Leave successfully marked for date: ${new Date(leaveDate).toDateString()}!` 
        });
        setLeaveDate('');
        setLeaveReason('');
      } else {
        setAlert({ type: 'error', message: json.message || 'Failed to submit leave.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Server communication error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-textMain font-sans flex flex-col md:flex-row transition-colors duration-500">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-surface border-r border-borderSoft p-6 flex flex-col gap-6 transition-colors duration-500">
        <div>
          <h2 className="text-xl font-black text-blue-500 tracking-wider">FLEXIBOOK</h2>
          <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Doctor Portal</p>
        </div>

        {/* Selected Doctor drop-down to simulate different logins */}
        <div className="bg-base border border-borderSoft p-3 rounded-lg flex flex-col gap-1.5 transition-colors duration-500">
          <label className="text-[10px] font-black uppercase text-textMuted">Doctor Profile</label>
          <select 
            value={selectedDoctorId} 
            onChange={(e) => setSelectedDoctorId(e.target.value)} 
            className="w-full bg-surface border border-borderSoft rounded p-1.5 text-xs text-textMain outline-none transition-colors duration-500"
          >
            {doctors.map(d => (
              <option key={d._id} value={d._id}>{d.userId ? d.userId.name : 'Doctor Profile'}</option>
            ))}
          </select>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm text-left transition-all flex items-center gap-3 ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-textMuted hover:bg-base hover:text-textMain'}`}
          >
            📅 Live Queue & Slots
          </button>
          <button 
            onClick={() => setActiveTab('leaves')} 
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm text-left transition-all flex items-center gap-3 ${activeTab === 'leaves' ? 'bg-blue-600 text-white shadow-md' : 'text-textMuted hover:bg-base hover:text-textMain'}`}
          >
            🌴 Request Leaves
          </button>
        </nav>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8 border-b border-borderSoft pb-5 transition-colors duration-500">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-textMain">Doctor Workspace</h1>
            <p className="text-sm text-textMuted mt-1">Manage checkups, call patients, and update your calendar slots live.</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 border border-emerald-500/20 rounded-full">
            Role: Onboarded Specialist
          </span>
        </header>

        {alert.message && (
          <div className={`p-4 mb-6 rounded-xl border font-bold text-sm ${alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {alert.message}
          </div>
        )}

        {/* Tab content 1: Appointments Queue */}
        {activeTab === 'appointments' && (
          <div className="animate-fade-in grid lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Live Patient Queue */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface border border-borderSoft rounded-2xl p-6 transition-colors duration-500">
                <h3 className="text-lg font-black text-textMain mb-5">👨‍👩‍👧‍👦 Upcoming Checkup List</h3>

                <div className="space-y-4">
                  {appointments.map((app) => (
                    <div 
                      key={app.id} 
                      className={`p-5 rounded-xl border flex justify-between items-center transition-all duration-300 ${
                        app.token === currentToken 
                          ? 'bg-blue-600/10 border-blue-500/30 text-textMain' 
                          : app.token < currentToken 
                            ? 'bg-base/40 border-borderSoft opacity-50' 
                            : 'bg-base border-borderSoft'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            app.token === currentToken ? 'bg-blue-50 text-white' : 'bg-surface text-textMuted border border-borderSoft'
                          }`}>
                            Token #{app.token}
                          </span>
                          <h4 className="font-bold text-base text-textMain">{app.patientName}</h4>
                        </div>
                        <p className="text-xs text-textMuted mt-1">Reason: {app.reason}</p>
                        <p className="text-xs text-textMuted mt-1 font-semibold">🕒 Scheduled Time: {app.time}</p>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        app.token === currentToken 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : app.token < currentToken 
                            ? 'bg-surface text-textMuted border border-borderSoft' 
                            : 'bg-surface text-textMuted border border-borderSoft'
                      }`}>
                        {app.token === currentToken ? 'Currently Consulting' : app.token < currentToken ? 'Visited' : 'Waiting'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Live Queue Controller */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-borderSoft rounded-2xl p-6 flex flex-col items-center text-center transition-colors duration-500">
                <p className="text-xs text-textMuted font-bold uppercase tracking-widest mb-2">Live Waiting Room Status</p>
                <h3 className="text-5xl font-black text-textMain my-3">Token #{currentToken}</h3>
                <p className="text-xs text-emerald-400 font-semibold mb-6">Patient Consultation In Progress</p>

                <button 
                  onClick={handleCallNext}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                >
                  Call Next Patient 🔔
                </button>
                <p className="text-[10px] text-slate-500 mt-3 font-semibold">Will trigger waiting room alert.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab content 2: Leaves Management */}
        {activeTab === 'leaves' && (
          <div className="animate-fade-in max-w-xl">
            <div className="bg-surface border border-borderSoft rounded-2xl p-6 transition-colors duration-500">
              <h3 className="text-lg font-black text-textMain mb-5">🌴 Register Leave Date</h3>
              
              <form onSubmit={handleAddLeave} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-textMuted font-bold uppercase tracking-wider">Leave Date</label>
                  <input 
                    type="date" 
                    required
                    value={leaveDate} 
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="bg-base border border-borderSoft focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-textMain transition-colors duration-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-textMuted font-bold uppercase tracking-wider">Reason for absence</label>
                  <textarea 
                    required
                    rows="4"
                    placeholder="e.g. Conference, Medical emergency"
                    value={leaveReason} 
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="bg-base border border-borderSoft focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-textMain resize-none transition-colors duration-500"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-xl text-sm mt-4"
                >
                  {loading ? 'Submitting request...' : 'Register Leave Date'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorPortal;
