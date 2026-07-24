import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const BookingHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to view your bookings.");
      }

      // Smart ID detection
      const userId = user._id || user.id;
      
      // Determine correct URL based on available user data
      const fetchUrl = (userId && userId !== "undefined")
        ? `${API_BASE_URL}/appointments/patient/${userId}`
        : `${API_BASE_URL}/appointments/my-appointments`;

      const response = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || data.error || "Unable to load your appointment history."
        );
      }

      const bookingList = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.appointments)
        ? data.appointments
        : Array.isArray(data)
        ? data
        : [];

      setAppointments(bookingList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";

      case "Completed":
        return "bg-blue-100 text-blue-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "In-Queue":
      case "queue":
        return "bg-purple-100 text-purple-700";

      case "In-Progress":
        return "bg-indigo-100 text-indigo-700";

      case "Missed":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl font-semibold">
        Loading your bookings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4 text-red-600 font-semibold">
        <p>{error}</p>
        <button
          onClick={fetchAppointments}
          className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">📋 My Bookings</h1>
          <button
            onClick={fetchAppointments}
            className="bg-white border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-2xl font-semibold">No bookings found</h2>
            <p className="text-gray-500 mt-2">
              Your appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment._id || appointment.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {appointment.hospitalName || appointment.hospital?.name || "Healthcare Partner"}
                    </h2>
                    <p className="text-gray-500">
                      {appointment.hospitalCity || appointment.hospitalAddress || appointment.hospital?.address || "Location unavailable"}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status || "Confirmed"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <p>
                      <strong>Patient:</strong> {appointment.patientName}
                    </p>
                    <p>
                      <strong>Contact:</strong> {appointment.patientEmail || appointment.patientPhone || "N/A"}
                    </p>
                    <p>
                      <strong>Doctor:</strong>{" "}
                      {appointment.doctorName ||
                        appointment.doctor?.userId?.name ||
                        appointment.specialization ||
                        "Assigned Doctor"}
                    </p>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {appointment.specialization || appointment.doctor?.specialization || "General Care"}
                    </p>
                  </div>

                  <div>
                    <p>
                      <strong>Date:</strong>{" "}
                      {appointment.appointmentDate
                        ? new Date(appointment.appointmentDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.timeSlot}
                    </p>
                    <p>
                      <strong>Token:</strong> #{appointment.tokenNumber || "—"}
                    </p>
                    <p>
                      <strong>Consultation Fee:</strong> ₹{appointment.consultationFee}
                    </p>
                    <p>
                      <strong>Payment:</strong> {appointment.paymentStatus || "Completed"}
                    </p>
                  </div>
                </div>

                {appointment.reasonForVisit && (
                  <div className="mt-5 border-t pt-4">
                    <p className="text-gray-700">
                      <strong>Reason:</strong> {appointment.reasonForVisit}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;