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
  const [doctorOnLeave, setDoctorOnLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentDate: getLocalDateInputValue(),
    timeSlot: '09:00 AM',
    reasonForVisit: ''
  });
  const [bookingStatus, setBookingStatus] = useState({ state: 'idle', message: '', tokenNumber: null });

  const checkDoctorLeave = async (doctor, selectedDate) => {
    if (!doctor || !doctor.id || doctor.id.startsWith("mock-doc")) {
      setDoctorOnLeave(false);
      setLeaveMessage("");
      return;
    }

    // 1. Availability Weekday Check
    if (Array.isArray(doctor.availability) && doctor.availability.length > 0) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const [year, month, day] = selectedDate.split('-').map(Number);
      const selectedDayName = weekdays[new Date(year, month - 1, day).getDay()];
      
      const isAvailableDay = doctor.availability.some(
        a => a.day.toLowerCase() === selectedDayName.toLowerCase()
      );

      if (!isAvailableDay) {
        setDoctorOnLeave(true);
        const sittingDays = doctor.availability.map(a => a.day).join(', ');
        setLeaveMessage(`Doctor is not available on ${selectedDayName}s. Sitting days: ${sittingDays}`);
        return;
      }
    }

    // 2. Fetch & Validate Registered Leave Dates
    try {
      const res = await fetch(`http://localhost:3000/api/doctors/${doctor.id}/leaves`);
      const data = await res.json();
      const leaves = data.data || data;

      const formatLocalDate = (dateObjOrStr) => {
        const d = new Date(dateObjOrStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayVal = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dayVal}`;
      };

      const leaveFound = Array.isArray(leaves) && leaves.some((leave) => {
        return formatLocalDate(leave.date) === selectedDate;
      });

      if (leaveFound) {
        setDoctorOnLeave(true);
        setLeaveMessage("Doctor is on leave on this date.");
      } else {
        setDoctorOnLeave(false);
        setLeaveMessage("");
      }
    } catch (err) {
      console.error('Error checking leaves:', err);
      setDoctorOnLeave(false);
      setLeaveMessage("");
    }
  };

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
    setDoctorOnLeave(false);
    setLeaveMessage("");
    checkDoctorLeave(doctor, getLocalDateInputValue());
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

    if (doctorOnLeave) {
      setBookingStatus({ 
        state: 'error', 
        message: leaveMessage || 'Doctor is on leave or unavailable on the selected date.' 
      });
      return;
    }

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
          availability: item.doctor.availability || [],
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
    <div className="min-h-screen bg-slate-50 text-slate-800 px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto pt-6">
        {/* Heading */}
        <div className="text-center mb-8">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-cyan-700 text-xs sm:text-sm font-bold shadow-sm mb-6">
            <Brain className="w-4 h-4 text-cyan-600" />
            AI Powered Healthcare Assistant
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-600 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              AI Symptom Checker
            </h1>
          </div>

          <p className="text-slate-600 text-base sm:text-lg mt-4 max-w-3xl mx-auto font-medium leading-relaxed">
            Describe your symptoms in detail. Our AI assistant will analyze them and
            recommend the most suitable medical specialist along with nearby doctors.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 flex justify-center">
          <div className="max-w-3xl w-full rounded-2xl border border-amber-200 bg-amber-50/70 py-3.5 px-5 flex items-start sm:items-center gap-3 shadow-sm">
            <AlertCircle className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-amber-800 font-semibold leading-relaxed">
              <strong>Disclaimer:</strong> This AI tool is intended for preliminary guidance only and does not replace consultation with a licensed medical professional.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto rounded-3xl bg-white border border-slate-200/80 shadow-xl p-5 sm:p-8">
          {/* AI Tip */}
          <div className="mb-6 rounded-xl bg-cyan-50/50 border border-cyan-200 p-4">
            <p className="text-cyan-800 text-sm font-semibold">
              💡 <strong>Tip:</strong> Mention your symptoms, how long you've had them, their severity, and any existing medical conditions for more accurate recommendations.
            </p>
          </div>

          <label className="text-base sm:text-lg font-bold text-slate-800 block mb-3">
            🩺 Describe your symptoms
          </label>
          <textarea
            rows={6}
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (error) setError("");
            }}
            placeholder="Example: I have had fever, headache and body pain for the last two days..."
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 resize-none placeholder:text-slate-400 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition outline-none font-medium text-slate-900 text-sm sm:text-base"
          />

          <div className="mt-6">
            <label className="text-base sm:text-lg font-bold text-slate-800 block mb-3">📍 Select City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-[18px] w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 pl-12 p-4 placeholder:text-slate-400 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition outline-none font-medium text-slate-900 text-sm sm:text-base"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-600 py-4 font-bold text-base sm:text-lg text-white hover:scale-[1.01] transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/15 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shrink-0"
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
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-3xl bg-cyan-50 border border-cyan-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-xs sm:text-sm font-black border border-cyan-200 uppercase tracking-wider mb-4">
                <Stethoscope className="w-4 h-4 text-cyan-700" /> Recommended Specialist: {result.specialty}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" /> Clinical Reasoning
              </h3>
              <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">{result.clinicalReasoning}</p>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mt-10 mb-4 max-w-3xl mx-auto">Recommended Doctors</h3>
            <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
              {result.doctors.map((doc) => (
                <div key={doc.id} className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex flex-col gap-4 justify-between hover:shadow-md hover:border-cyan-400 transition-all duration-300">
                  <div>
                    <h4 className="font-black text-slate-900 text-lg sm:text-xl">{doc.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold">{doc.hospital}</p>
                  </div>
                  <div className="flex gap-4 text-xs sm:text-sm text-slate-500 font-bold">
                    <span>Exp: {doc.experience} years</span>
                    <span>Rating: {doc.rating} ★</span>
                  </div>
                  <button 
                    onClick={() => handleBookingOpen(doc)}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-cyan-600 transition-colors active:scale-[0.98] transition-all duration-150"
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-955/60 px-4 py-6 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl p-6 relative">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-800 bg-cyan-100/50 border border-cyan-200 px-2.5 py-1 rounded w-fit">
                  Book AI Recommended Doctor
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">{bookingDoctor.name}</h2>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  {bookingDoctor.hospital} · Fee: ₹{bookingDoctor.fees}
                </p>
              </div>
              <button
                type="button"
                onClick={handleBookingClose}
                disabled={bookingStatus.state === 'loading'}
                className="rounded-full border border-slate-200 h-8 w-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-xl font-bold text-slate-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            {bookingStatus.state === 'success' ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-2xl font-black text-emerald-600 shadow-inner">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-slate-900">Booking Confirmed</h3>
                <p className="mt-2 text-sm text-slate-600 font-semibold">{bookingStatus.message}</p>
                {bookingStatus.tokenNumber && (
                  <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Queue Token Number</p>
                    <p className="mt-1 text-3xl font-black text-cyan-700">#{bookingStatus.tokenNumber}</p>
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
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {bookingStatus.message}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">
                    Patient Name
                    <input
                      type="text"
                      name="patientName"
                      value={bookingForm.patientName}
                      onChange={handleBookingFieldChange}
                      required
                      className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                      placeholder="Your full name"
                    />
                  </label>

                  <label className="text-sm font-bold text-slate-700">
                    Email
                    <input
                      type="email"
                      name="patientEmail"
                      value={bookingForm.patientEmail}
                      onChange={handleBookingFieldChange}
                      required
                      className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                      placeholder="name@example.com"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">
                    Phone
                    <input
                      type="tel"
                      name="patientPhone"
                      value={bookingForm.patientPhone}
                      onChange={handleBookingFieldChange}
                      className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                      placeholder="Optional"
                    />
                  </label>

                  <label className="text-sm font-bold text-slate-700">
                    Date
                    <input
                      type="date"
                      name="appointmentDate"
                      min={getLocalDateInputValue()}
                      value={bookingForm.appointmentDate}
                      onChange={(e) => {
                        handleBookingFieldChange(e);
                        checkDoctorLeave(bookingDoctor, e.target.value);
                      }}
                      required
                      className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                    />
                    {leaveMessage && (
                      <span className="block mt-1.5 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                        ⚠️ {leaveMessage}
                      </span>
                    )}
                  </label>
                </div>

                <label className="block text-sm font-bold text-slate-700">
                  Time Slot
                  <select
                    name="timeSlot"
                    value={bookingForm.timeSlot}
                    onChange={handleBookingFieldChange}
                    className="mt-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                  >
                    {HEALTHCARE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot} className="bg-white text-slate-800">{slot}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-bold text-slate-700">
                  Reason for Visit
                  <textarea
                    name="reasonForVisit"
                    value={bookingForm.reasonForVisit}
                    onChange={handleBookingFieldChange}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition"
                    placeholder="Briefly describe your symptoms or visit reason"
                  />
                </label>

                <button
                  type="submit"
                  disabled={bookingStatus.state === 'loading' || doctorOnLeave}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3.5 text-sm font-bold text-white shadow-md hover:scale-[1.01] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {doctorOnLeave ? 'Doctor Unavailable' : bookingStatus.state === 'loading' ? 'Booking...' : 'Confirm Booking'}
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