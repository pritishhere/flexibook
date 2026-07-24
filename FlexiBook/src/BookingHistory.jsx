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

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      if (!user?._id || !token) {
        throw new Error("Please login first.");
      }

      const response = await fetch(
        `${API_BASE_URL}/appointments/patient/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load bookings.");
      }

      setAppointments(data.data || []);
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
      <div className="min-h-screen flex justify-center items-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          📋 My Bookings
        </h1>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="text-2xl font-semibold">
              No bookings found
            </h2>

            <p className="text-gray-500 mt-2">
              Your appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {appointments.map((appointment) => (

              <div
                key={appointment._id}
                className="bg-white rounded-xl shadow-lg p-6"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="text-2xl font-bold">
                      {appointment.hospital?.name || "Hospital"}
                    </h2>

                    <p className="text-gray-500">
                      {appointment.hospital?.address}
                    </p>

                  </div>

                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>

                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">

                  <div>

                    <p>
                      <strong>Patient:</strong>{" "}
                      {appointment.patientName}
                    </p>

                    <p>
                      <strong>Relationship:</strong>{" "}
                      {appointment.patientRelationship}
                    </p>

                    <p>
                      <strong>Doctor:</strong>{" "}
                      {appointment.doctor?.userId?.name ||
                        "Assigned Doctor"}
                    </p>

                    <p>
                      <strong>Specialization:</strong>{" "}
                      {appointment.doctor?.specialization}
                    </p>

                  </div>

                  <div>

                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                    </p>

                    <p>
                      <strong>Time:</strong>{" "}
                      {appointment.timeSlot}
                    </p>

                    <p>
                      <strong>Token:</strong>{" "}
                      #{appointment.tokenNumber}
                    </p>

                    <p>
                      <strong>Consultation Fee:</strong> ₹
                      {appointment.consultationFee}
                    </p>

                    <p>
                      <strong>Payment:</strong>{" "}
                      {appointment.paymentStatus}
                    </p>

                  </div>

                </div>

                <div className="mt-5 border-t pt-4">

                  <p className="text-gray-700">
                    <strong>Reason:</strong>{" "}
                    {appointment.reasonForVisit}
                  </p>

                </div>

              </div>

            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;