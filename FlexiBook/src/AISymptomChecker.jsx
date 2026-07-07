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
      const response = await axios.post(
        "http://localhost:3000/api/ai/symptom-check",
        {
          symptoms,
          city,
        }
      );

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
      setError(
        err.response?.data?.message ||
        "Failed to analyze symptoms."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-textMain px-6 -mt-16 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        {/* Heading */}
<div className="text-center mb-6">

  {/* AI Badge */}
  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-300 text-sm font-medium mb-6">
    <Brain className="w-4 h-4" />
    AI Powered Healthcare Assistant
  </div>

  <div className="flex items-center justify-center gap-3">
    <Brain className="w-10 h-10 text-cyan-400" />
    <h1 className="text-5xl font-extrabold tracking-tight">
      AI Symptom Checker
    </h1>
  </div>

  <p className="text-gray-400 text-lg mt-5 max-w-3xl mx-auto">
    Describe your symptoms in detail. Our AI assistant will analyze them and
    recommend the most suitable medical specialist along with nearby doctors.
  </p>

</div>

        {/* Disclaimer */}
        <div className="mb-8 flex justify-center">
        <div className="max-w-3xl w-full rounded-2xl border border-amber-500/20 bg-amber-500/10 py-3 px-5 flex items-center gap-3">          <AlertCircle className="text-amber-400 w-6 h-6 mt-1" />
          <p className="text-sm text-amber-100">
            <strong>Disclaimer:</strong> This AI tool is intended for preliminary guidance only and does not replace consultation with a licensed medical professional.
          </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8">

        {/* AI Tip */}
        <div className="mb-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
            <p className="text-cyan-300 text-sm">
      💡        <strong>Tip:</strong> Mention your symptoms, how long you've had them, their severity, and any existing medical conditions for more accurate recommendations.
             </p>
        </div>
         <label className="text-lg font-semibold block mb-3">
            🩺 Describe your symptoms
        </label>
          <textarea
            rows={8}
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (error) setError("");
            }}
            placeholder="Example: I have had fever, headache and body pain for the last two days..."
            className="w-full rounded-2xl bg-black/20 border border-white/10 p-5 resize-none placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
          />

          <div className="mt-7">
            <label className="text-lg font-semibold block mb-3">📍 Select City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="w-full rounded-2xl bg-black/20 border border-white/10 pl-12 p-4 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 py-4 font-semibold text-lg hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Consulting AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Symptoms with AI
              </>
            )}
          </button>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl bg-cyan-950/20 border border-cyan-500/20 p-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-bold uppercase tracking-wider mb-4">
                <Stethoscope className="w-4 h-4" /> Recommended Specialist: {result.specialty}
              </div>
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-cyan-400" /> Clinical Reasoning
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">{result.clinicalReasoning}</p>
            </div>

            <h3 className="text-2xl font-bold">Recommended Doctors</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {result.doctors.map((doc) => (
                <div key={doc.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-xl">{doc.name}</h4>
                    <p className="text-sm text-gray-400">{doc.hospital}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Exp: {doc.experience}</span>
                    <span>Rating: {doc.rating} ★</span>
                  </div>
                  <button 
                    onClick={() => handleBookingOpen(doc)}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {bookingDoctor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl p-6 relative">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-cyan-400">
                  Book AI Recommended Doctor
                </p>
                <h2 className="mt-1 text-2xl font-black">{bookingDoctor.name}</h2>
                <p className="mt-1 text-sm font-medium text-gray-400">
                  {bookingDoctor.hospital} · Fee: ₹{bookingDoctor.fees}
                </p>
              </div>
              <button
                type="button"
                onClick={handleBookingClose}
                disabled={bookingStatus.state === 'loading'}
                className="rounded-full border border-white/10 px-3 py-1 bg-white/5 hover:bg-white/10 text-xl font-bold text-gray-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            {bookingStatus.state === 'success' ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-2xl font-black text-emerald-400">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-white">Booking Confirmed</h3>
                <p className="mt-2 text-sm text-gray-300">{bookingStatus.message}</p>
                {bookingStatus.tokenNumber && (
                  <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-400">Queue Token Number</p>
                    <p className="mt-1 text-3xl font-black text-cyan-300">#{bookingStatus.tokenNumber}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleBookingClose}
                  className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700 px-8 py-3 text-sm font-bold text-white shadow-md transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 pt-5">
                {bookingStatus.state === 'error' && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                    {bookingStatus.message}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-gray-300">
                    Patient Name
                    <input
                      type="text"
                      name="patientName"
                      value={bookingForm.patientName}
                      onChange={handleBookingFieldChange}
                      required
                      className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="text-sm font-bold text-gray-300">
                    Email
                    <input
                      type="email"
                      name="patientEmail"
                      value={bookingForm.patientEmail}
                      onChange={handleBookingFieldChange}
                      required
                      className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                      placeholder="name@example.com"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-gray-300">
                    Phone
                    <input
                      type="tel"
                      name="patientPhone"
                      value={bookingForm.patientPhone}
                      onChange={handleBookingFieldChange}
                      className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                      placeholder="Optional"
                    />
                  </label>

                  <label className="text-sm font-bold text-gray-300">
                    Date
                    <input
                      type="date"
                      name="appointmentDate"
                      min={getLocalDateInputValue()}
                      value={bookingForm.appointmentDate}
                      onChange={handleBookingFieldChange}
                      required
                      className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                    />
                  </label>
                </div>

                <label className="block text-sm font-bold text-gray-300">
                  Time Slot
                  <select
                    name="timeSlot"
                    value={bookingForm.timeSlot}
                    onChange={handleBookingFieldChange}
                    className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition select-custom"
                  >
                    {HEALTHCARE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot} className="bg-slate-900 text-white">{slot}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-bold text-gray-300">
                  Reason for Visit
                  <textarea
                    name="reasonForVisit"
                    value={bookingForm.reasonForVisit}
                    onChange={handleBookingFieldChange}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                    placeholder="Briefly describe your symptoms or visit reason"
                  />
                </label>

                <button
                  type="submit"
                  disabled={bookingStatus.state === 'loading'}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-md hover:scale-[1.01] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
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