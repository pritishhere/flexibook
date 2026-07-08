import axios from "axios";
import React, { useState } from "react";
import {
  MapPin,
  Brain,
  Loader2,
  Stethoscope,
  BookOpen,
  AlertCircle,
  Sparkles
} from "lucide-react";

const HEALTHCARE_TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const getLocalDateInputValue = () => {
  const local = new Date();
  const offset = local.getTimezoneOffset();
  const localDate = new Date(local.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

function AISymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: getLocalDateInputValue(),
    timeSlot: '09:00 AM',
    reasonForVisit: ''
  });
  const [bookingStatus, setBookingStatus] = useState({ state: 'idle', message: '', tokenNumber: null });

  const handleBookingOpen = (doctor) => {
    setBookingDoctor(doctor);
    setBookingForm({
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      appointmentDate: getLocalDateInputValue(),
      timeSlot: '09:00 AM',
      reasonForVisit: `AI Symptom Check: ${symptoms.trim()}`
    });
    setBookingStatus({ state: 'idle', message: '', tokenNumber: null });
  };

  const handleBookingClose = () => {
    if (bookingStatus.state === 'loading') return;
    setBookingDoctor(null);
    setBookingStatus({ state: 'idle', message: '', tokenNumber: null });
  };

  const handleBookingFieldChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    setBookingStatus({ state: 'loading', message: 'Booking your appointment...', tokenNumber: null });

    try {
      const response = await axios.post("http://localhost:3000/api/appointments/book", {
        patientName: bookingForm.patientName.trim(),
        patientEmail: bookingForm.patientEmail.trim(),
        patientPhone: bookingForm.patientPhone.trim(),
        doctor: bookingDoctor.id,
        hospital: bookingDoctor.hospitalId,
        hospitalName: bookingDoctor.hospital,
        hospitalCity: bookingDoctor.hospitalCity || city || 'Kolkata',
        hospitalAddress: bookingDoctor.hospitalAddress || `${bookingDoctor.hospitalCity || city || 'Kolkata'}, India`,
        hospitalContactNumber: '9876543210',
        specialization: bookingDoctor.specialization,
        consultationFee: bookingDoctor.fees,
        appointmentDate: bookingForm.appointmentDate,
        timeSlot: bookingForm.timeSlot,
        reasonForVisit: bookingForm.reasonForVisit.trim(),
        bookingMode: 'appointment'
      });

      if (response.data.success) {
        setBookingStatus({
          state: 'success',
          message: `Your appointment with ${bookingDoctor.name} has been booked successfully!`,
          tokenNumber: response.data.data?.tokenNumber || null
        });
      } else {
        throw new Error(response.data.message || 'Failed to book appointment');
      }
    } catch (err) {
      setBookingStatus({
        state: 'error',
        message: err.response?.data?.message || err.message || 'Unable to book appointment.'
      });
    }
  };

  const handleAnalyze = async () => {
    if (symptoms.trim().length < 10) {
      setError("Please describe your symptoms in more detail (minimum 10 characters).");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post("http://localhost:3000/api/ai/symptom-check", { symptoms, city });
      setResult({
        specialty: response.data.suggestedSpecialty,
        clinicalReasoning: response.data.reason,
        doctors: response.data.recommendations.map((item) => ({
          id: item.doctor._id,
          name: item.doctor.name,
          hospital: item.hospital?.name || "Hospital Not Available",
          hospitalId: item.hospital?._id || null,
          hospitalCity: item.hospital?.city || "",
          hospitalAddress: item.hospital?.address || "",
          specialization: item.doctor.specialization || "",
          experience: item.doctor.experience || "N/A",
          fees: item.doctor.fees || 500,
          rating: item.hospital?.rating || "N/A",
        })),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze symptoms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 pb-12 pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-blue-600 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" /> AI Powered Healthcare Assistant
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">AI Symptom Checker</h1>
          <p className="text-slate-600 text-lg mt-5 max-w-3xl mx-auto">
            Describe your symptoms in detail. Our AI assistant will analyze them and recommend the most suitable medical specialist.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="max-w-3xl w-full rounded-2xl border border-amber-200 bg-amber-50 py-3 px-5 flex items-center gap-3 text-amber-900 shadow-sm">
            <AlertCircle className="text-amber-600 w-6 h-6 mt-1" />
            <p className="text-sm">
              <strong>Disclaimer:</strong> This AI tool is for guidance only and does not replace consultation with a medical professional.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-8">
          <div className="mb-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Mention symptoms, duration, severity, and existing conditions for better results.
            </p>
          </div>
          
          <label className="text-lg font-semibold block mb-3 text-slate-800">🩺 Describe your symptoms</label>
          <textarea
            rows={8}
            value={symptoms}
            onChange={(e) => { setSymptoms(e.target.value); if (error) setError(""); }}
            placeholder="Example: I have had fever, headache and body pain for the last two days..."
            className="w-full rounded-2xl bg-slate-50 border border-slate-300 p-5 resize-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />

          <div className="mt-7">
            <label className="text-lg font-semibold block mb-3 text-slate-800">📍 Select City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="w-full rounded-2xl bg-slate-50 border border-slate-300 pl-12 p-4 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 font-semibold text-lg text-white hover:scale-[1.01] transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <><Loader2 className="animate-spin w-5 h-5" /> Consulting AI...</> : <><Sparkles className="w-5 h-5" /> Analyze Symptoms with AI</>}
          </button>

          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        </div>

        {result && (
          <div className="mt-12 space-y-8 animate-in fade-in duration-500">
            <div className="rounded-3xl bg-blue-50 border border-blue-100 p-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-4">
                <Stethoscope className="w-4 h-4" /> Recommended Specialist: {result.specialty}
              </div>
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-blue-900">
                <BookOpen className="w-6 h-6 text-blue-600" /> Clinical Reasoning
              </h3>
              <p className="text-blue-800 text-lg leading-relaxed">{result.clinicalReasoning}</p>
            </div>

            <h3 className="text-2xl font-bold text-slate-900">Recommended Doctors</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {result.doctors.map((doc) => (
                <div key={doc.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <div>
                    <h4 className="font-bold text-xl text-slate-900">{doc.name}</h4>
                    <p className="text-sm text-slate-500">{doc.hospital}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span>Exp: {doc.experience}</span>
                    <span>Rating: {doc.rating} ★</span>
                  </div>
                  <button onClick={() => handleBookingOpen(doc)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {bookingDoctor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 relative">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Book Recommended Doctor</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{bookingDoctor.name}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{bookingDoctor.hospital} · Fee: ₹{bookingDoctor.fees}</p>
              </div>
              <button onClick={handleBookingClose} className="rounded-full px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xl font-bold text-slate-600 transition-colors">&times;</button>
            </div>

            {bookingStatus.state === 'success' ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl font-black">✓</div>
                <h3 className="text-2xl font-black text-slate-900">Booking Confirmed</h3>
                <p className="mt-2 text-sm text-slate-600">{bookingStatus.message}</p>
                {bookingStatus.tokenNumber && <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-600">Token</p><p className="mt-1 text-3xl font-black text-blue-900">#{bookingStatus.tokenNumber}</p></div>}
                <button onClick={handleBookingClose} className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 px-8 py-3 text-sm font-bold text-white shadow-md transition-colors">Done</button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 pt-5">
                {bookingStatus.state === 'error' && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{bookingStatus.message}</div>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">Patient Name <input type="text" name="patientName" value={bookingForm.patientName} onChange={handleBookingFieldChange} required className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                  <label className="text-sm font-bold text-slate-700">Email <input type="email" name="patientEmail" value={bookingForm.patientEmail} onChange={handleBookingFieldChange} required className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">Phone <input type="tel" name="patientPhone" value={bookingForm.patientPhone} onChange={handleBookingFieldChange} className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                  <label className="text-sm font-bold text-slate-700">Date <input type="date" name="appointmentDate" min={getLocalDateInputValue()} value={bookingForm.appointmentDate} onChange={handleBookingFieldChange} required className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                </div>
                <label className="block text-sm font-bold text-slate-700">Time Slot <select name="timeSlot" value={bookingForm.timeSlot} onChange={handleBookingFieldChange} className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">{HEALTHCARE_TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
                <label className="block text-sm font-bold text-slate-700">Reason for Visit <textarea name="reasonForVisit" value={bookingForm.reasonForVisit} onChange={handleBookingFieldChange} rows={3} className="mt-2 w-full resize-none rounded-xl bg-slate-50 border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>
                <button type="submit" disabled={bookingStatus.state === 'loading'} className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95 disabled:opacity-50">
                  {bookingStatus.state === 'loading' ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AISymptomChecker;