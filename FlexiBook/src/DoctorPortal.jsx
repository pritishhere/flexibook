import { useState, useEffect } from 'react';
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const DoctorPortal = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [currentToken, setCurrentToken] = useState(1);
  
  // Leave form state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to read current user:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctors`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          const doctorList = json.data;
          setDoctors(doctorList);

          const matchedDoctor = doctorList.find((doctor) => {
            const doctorUserId = doctor?.userId?._id || doctor?.userId || '';
            return String(doctorUserId) === String(currentUser._id);
          });

          if (matchedDoctor) {
            setSelectedDoctorId(matchedDoctor._id);
          } else {
            setSelectedDoctorId('');
            setAlert({
              type: 'error',
              message: 'No doctor profile is linked to your account yet. Please contact the admin.'
            });
          }
        } else {
          setDoctors([]);
          setSelectedDoctorId('');
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err.message);
      }
    };

    fetchDoctors();
  }, [currentUser?._id]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDoctorId) {
        setAppointments([]);
        setCurrentToken(1);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const doctorRes = await fetch(`${API_BASE_URL}/doctors/${selectedDoctorId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const doctorJson = await doctorRes.json();
        const hospitalId = doctorJson?.data?.hospitalId?._id || doctorJson?.data?.hospitalId || '';

        if (!hospitalId) {
          setAppointments([]);
          setCurrentToken(1);
          return;
        }

        const appointmentsRes = await fetch(`${API_BASE_URL}/appointments/hospital/${hospitalId}?doctorId=${selectedDoctorId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const json = await appointmentsRes.json();

        if (json.success) {
          const doctorAppointments = (json.data || [])
            .map((appointment) => ({
              id: appointment._id,
              patientName: appointment.patientName || appointment.patient?.name || 'Patient',
              token: appointment.tokenNumber,
              time: appointment.timeSlot || 'Scheduled',
              reason: appointment.reasonForVisit || 'General Checkup',
              status: appointment.status || 'Pending',
              appointmentDate: appointment.appointmentDate,
              hospitalName: appointment.hospital?.name || 'Hospital'
            }))
            .sort((a, b) => a.token - b.token);

          setAppointments(doctorAppointments);
          const nextAppointment = doctorAppointments.find(
            (appointment) => !['Completed', 'Cancelled', 'Missed'].includes(appointment.status)
          );
          setCurrentToken(nextAppointment?.token || 1);
        } else {
          setAppointments([]);
          setCurrentToken(1);
        }
      } catch (err) {
        console.error('Failed to load appointments:', err.message);
        setAppointments([]);
        setCurrentToken(1);
      }
    };

    fetchAppointments();
  }, [selectedDoctorId]);

 const handleCallNext = async () => {
  if (!selectedDoctorId) return;

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API_BASE_URL}/appointments/next-patient`,
      {
        doctorId: selectedDoctorId,
        currentServingToken: currentToken
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (currentToken < appointments.length) {
      setCurrentToken(prev => prev + 1);

      setAlert({
        type: "success",
        message: `Patient token #${currentToken + 1} has been called.`
      });
    } else {
      setAlert({
        type: "success",
        message: "All scheduled patients checked."
      });
    }

  } catch (err) {
    setAlert({
      type: "error",
      message:
        err.response?.data?.message ||
        "Unable to notify next patient."
    });
  }
};

const handleEmergency = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${API_BASE_URL}/appointments/trigger-emergency`,
      {
        message:
          "Doctor has been called for an emergency. Please expect a delay."
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setAlert({
      type: "success",
      message: "Emergency broadcast sent successfully."
    });

  } catch (err) {
    setAlert({
      type: "error",
      message:
        err.response?.data?.message ||
        "Failed to send emergency broadcast."
    });
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

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/doctors/${selectedDoctorId}/leave`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
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

  const selectedDoctorData = doctors.find((doctor) => doctor._id === selectedDoctorId) || null;

  return (
    <div className="min-h-screen bg-base text-textMain font-sans flex flex-col md:flex-row transition-colors duration-500">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-surface border-r border-borderSoft p-6 flex flex-col gap-6 transition-colors duration-500">
        <div>
          <h2 className="text-xl font-black text-blue-500 tracking-wider">FLEXIBOOK</h2>
          <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Doctor Portal</p>
        </div>

        <div className="bg-base border border-borderSoft p-3 rounded-lg flex flex-col gap-1.5 transition-colors duration-500">
          <label className="text-[10px] font-black uppercase text-textMuted">Your Doctor Profile</label>
          {selectedDoctorData ? (
            <div>
              <p className="text-sm font-bold text-textMain">
                {selectedDoctorData.userId?.name || 'Your doctor profile'}
              </p>
              <p className="text-[11px] text-textMuted mt-1">
                {selectedDoctorData.specialization || 'Specialist'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-textMuted">No profile linked to your account yet.</p>
          )}
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
                            app.token === currentToken ? 'bg-blue-600 text-white' : 'bg-surface text-textMuted border border-borderSoft'
                          }`}>
                            Token #{app.token}
                          </span>
                          <h4 className="font-bold text-base text-textMain">{app.patientName}</h4>
                        </div>
                        <p className="text-xs text-textMuted mt-1">Reason: {app.reason}</p>
                        <p className="text-xs text-textMuted mt-1 font-semibold">🕒 Time: {app.time}</p>
                        <p className="text-[11px] text-textMuted mt-1">{app.hospitalName}</p>
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
                <p className="text-xs text-emerald-400 font-semibold mb-6">Next patient for your queue</p>

                <button 
                  onClick={handleCallNext}
                  disabled={!selectedDoctorId}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Call Next Patient 🔔
                </button>
                <button
                  onClick={handleEmergency}
                  disabled={!selectedDoctorId}
                  className="mt-3 w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚨 Emergency Alert
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
