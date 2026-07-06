import { useState, useEffect } from 'react';

const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  
  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'General Physician',
    experience: '',
    consultationFee: '',
    slots: [{ day: 'Monday', startTime: '09:00', endTime: '13:00' }]
  });
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Fetch all hospitals in the system to let business owner choose which hospital they are managing
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/hospitals');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setHospitals(json.data);
          // Set default to "testing hospital" or the first available one
          const testHosp = json.data.find(h => h.name.toLowerCase().includes('testing'));
          setSelectedHospitalId(testHosp ? testHosp._id : json.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load hospitals:', err.message);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch doctors for the selected hospital
  const fetchDoctors = async () => {
    if (!selectedHospitalId) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/doctors?hospitalId=${selectedHospitalId}`);
      const json = await res.json();
      if (json.success) {
        setDoctors(json.data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedHospitalId]);

  const handleAddSlot = () => {
    setDoctorForm({
      ...doctorForm,
      slots: [...doctorForm.slots, { day: 'Monday', startTime: '09:00', endTime: '13:00' }]
    });
  };

  const handleRemoveSlot = (index) => {
    const updated = doctorForm.slots.filter((_, idx) => idx !== index);
    setDoctorForm({ ...doctorForm, slots: updated });
  };

  const handleSlotChange = (index, field, value) => {
    const updated = doctorForm.slots.map((s, idx) => {
      if (idx === index) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setDoctorForm({ ...doctorForm, slots: updated });
  };

  const handleSubmitDoctor = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!selectedHospitalId) {
      setAlert({ type: 'error', message: 'Please select or create an organization first!' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: doctorForm.name,
        email: doctorForm.email,
        password: doctorForm.password,
        hospitalId: selectedHospitalId,
        specialization: doctorForm.specialization,
        experience: Number(doctorForm.experience),
        consultationFee: Number(doctorForm.consultationFee),
        availability: doctorForm.slots
      };

      const res = await fetch('http://localhost:3000/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        setAlert({ type: 'success', message: 'Doctor onboarded successfully!' });
        setDoctorForm({
          name: '',
          email: '',
          password: '',
          specialization: 'General Physician',
          experience: '',
          consultationFee: '',
          slots: [{ day: 'Monday', startTime: '09:00', endTime: '13:00' }]
        });
        fetchDoctors();
      } else {
        setAlert({ type: 'error', message: json.message || 'Failed to add doctor.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Server communication error: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor profile and their user credentials?')) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/doctors/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setAlert({ type: 'success', message: 'Doctor deleted successfully!' });
        fetchDoctors();
      } else {
        setAlert({ type: 'error', message: json.message || 'Failed to delete doctor.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-blue-500 tracking-wider">FLEXIBOOK</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Command Center</p>
        </div>

        {/* Selected Hospital drop-down */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400">Managing Business</label>
          <select 
            value={selectedHospitalId} 
            onChange={(e) => setSelectedHospitalId(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 outline-none"
          >
            {hospitals.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm text-left transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            📊 Analytics Overview
          </button>
          <button 
            onClick={() => setActiveTab('doctors')} 
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm text-left transition-all flex items-center gap-3 ${activeTab === 'doctors' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            👨‍⚕️ Manage Doctors
          </button>
        </nav>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Organization Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Control your business, schedules, and personnel slots instantly.</p>
          </div>
          <span className="bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 border border-blue-500/20 rounded-full">
            Role: Business Owner
          </span>
        </header>

        {alert.message && (
          <div className={`p-4 mb-6 rounded-xl border font-bold text-sm ${alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {alert.message}
          </div>
        )}

        {/* Tab content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in space-y-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Revenue', value: '₹45,500', icon: '💰', change: '+12% from last week' },
                { title: 'Active Bookings', value: doctors.length * 4 + 1, icon: '📅', change: '8 queues active' },
                { title: 'Registered Doctors', value: doctors.length, icon: '👨‍⚕️', change: 'Live status synced' },
                { title: 'Average Rating', value: '★ 4.8', icon: '⭐', change: 'Based on 45 reviews' }
              ].map((card, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all shadow-sm">
                  <div className="absolute top-0 right-0 p-4 text-3xl opacity-20">{card.icon}</div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-1">{card.value}</h3>
                  <p className="text-[10px] text-emerald-400 font-semibold">{card.change}</p>
                </div>
              ))}
            </div>

            {/* Quick Summary list */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-black text-white mb-4">Clinic Operations Summary</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your clinics are running smoothly. The automated WhatsApp Web reminder service is active and checking upcoming patient slots. All checkup data created by business dashboards dynamically syncs to search portals immediately.
              </p>
            </div>
          </div>
        )}

        {/* Tab content 2: Doctors Onboarding & List */}
        {activeTab === 'doctors' && (
          <div className="animate-fade-in grid xl:grid-cols-3 gap-8">
            {/* Left 2 Cols: Doctors list */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                  <span>👨‍⚕️ Active Onboarded Doctors</span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">{doctors.length}</span>
                </h3>

                {loading && <p className="text-sm text-slate-400 animate-pulse">Updating doctor listings...</p>}
                
                {!loading && doctors.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <p className="text-base font-bold">No Doctors Registered Yet</p>
                    <p className="text-xs mt-1">Use the panel on the right to onboard your first doctor profile!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {doctors.map((doc) => (
                      <div key={doc._id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700 transition-colors">
                        <div>
                          <h4 className="font-bold text-white text-base flex items-center gap-2">
                            {doc.userId ? doc.userId.name : 'Unknown Doctor'}
                            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20">{doc.specialization}</span>
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">Email: {doc.userId ? doc.userId.email : 'N/A'}</p>
                          <div className="flex gap-4 mt-2.5 text-xs text-slate-300 font-semibold">
                            <span>💼 Experience: {doc.experience} Years</span>
                            <span>💵 Consultation Fee: ₹{doc.fees}</span>
                          </div>
                          
                          {/* Availability badges */}
                          {doc.availability && doc.availability.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {doc.availability.map((s, idx) => (
                                <span key={idx} className="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-medium">
                                  {s.day} ({s.startTime}-{s.endTime})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => handleDeleteDoctor(doc._id)}
                          className="px-4 py-2 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold bg-red-500/5 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                        >
                          Remove 🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Onboard doctor form */}
            <div className="xl:col-span-1">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-black text-white mb-5">📋 Onboard New Doctor</h3>
                
                <form onSubmit={handleSubmitDoctor} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Dr. Amit Roy"
                      value={doctorForm.name} 
                      onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                      className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. doctor@hospital.com"
                      value={doctorForm.email} 
                      onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                      className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Portal Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="At least 6 characters"
                      value={doctorForm.password} 
                      onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                      className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Specialty</label>
                      <select
                        value={doctorForm.specialization} 
                        onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                        className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-white"
                      >
                        <option value="General Physician">General Physician</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Dentist">Dentist</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experience (Yrs)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="e.g. 8"
                        value={doctorForm.experience} 
                        onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})}
                        className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Consultation Fee (₹)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 500"
                      value={doctorForm.consultationFee} 
                      onChange={(e) => setDoctorForm({...doctorForm, consultationFee: e.target.value})}
                      className="bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none rounded-lg p-3 text-sm text-white"
                    />
                  </div>

                  {/* Availability Slots Builder */}
                  <div className="border-t border-slate-800 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-300 font-bold uppercase tracking-wider">Working Shifts</label>
                      <button 
                        type="button" 
                        onClick={handleAddSlot}
                        className="text-xs text-blue-500 font-bold hover:underline"
                      >
                        + Add Day
                      </button>
                    </div>

                    {doctorForm.slots.map((s, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-2 relative">
                        {doctorForm.slots.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSlot(idx)}
                            className="absolute top-1 right-2 text-xs text-red-500 font-bold hover:underline"
                          >
                            ×
                          </button>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <select 
                            value={s.day} 
                            onChange={(e) => handleSlotChange(idx, 'day', e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 p-1.5 rounded"
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            placeholder="09:00"
                            value={s.startTime}
                            onChange={(e) => handleSlotChange(idx, 'startTime', e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-center text-slate-300 p-1.5 rounded"
                          />
                          <input 
                            type="text" 
                            placeholder="13:00"
                            value={s.endTime}
                            onChange={(e) => handleSlotChange(idx, 'endTime', e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-center text-slate-300 p-1.5 rounded"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-xl text-sm mt-4 shadow-lg shadow-blue-500/10"
                  >
                    {loading ? 'Processing Onboarding...' : 'Onboard Doctor Profile'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessDashboard;
