import React from "react";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityStep({
  formData,
  updateField,
  previousStep,
  nextStep,
}) {

  const toggleDay = (day) => {
    const selected = formData.workingDays || [];

    if (selected.includes(day)) {
      updateField(
        "workingDays",
        selected.filter((d) => d !== day)
      );
    } else {
      updateField("workingDays", [...selected, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-8 lg:p-10"
    >

      {/* Heading */}

      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Availability
        </h2>

        <p className="mt-2 text-slate-500">
          Configure your business working hours and appointment preferences.
        </p>
      </div>

      {/* Working Days */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Working Days
        </h3>

        <div className="flex flex-wrap gap-4">

          {weekDays.map((day) => {

            const selected =
              formData.workingDays?.includes(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-full border px-5 py-3 transition-all
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 hover:border-blue-500"
                }`}
              >
                {day}
              </button>
            );

          })}

        </div>

      </div>

      {/* Business Hours */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-6 text-lg font-semibold">
          Business Hours
        </h3>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Opening Time
            </label>

            <input
              type="time"
              value={formData.openTime}
              onChange={(e) =>
                updateField("openTime", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Closing Time
            </label>

            <input
              type="time"
              value={formData.closeTime}
              onChange={(e) =>
                updateField("closeTime", e.target.value)
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />

          </div>

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium">
              Lunch Break (Optional)
            </label>

            <input
              type="text"
              value={formData.lunchBreak}
              onChange={(e) =>
                updateField("lunchBreak", e.target.value)
              }
              placeholder="1:00 PM - 2:00 PM"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />

          </div>

        </div>

      </div>
      {/* Appointment Preferences */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-6 text-lg font-semibold">
          Appointment Preferences
        </h3>

        <div className="space-y-5">

          <div className="flex items-center justify-between rounded-xl border border-slate-300 px-5 py-4">

            <div>

              <h4 className="font-semibold">
                Appointment Required
              </h4>

              <p className="text-sm text-slate-500">
                Customers must book an appointment before visiting.
              </p>

            </div>

            <input
              type="checkbox"
              checked={formData.appointmentRequired}
              onChange={(e) =>
                updateField("appointmentRequired", e.target.checked)
              }
              className="h-5 w-5"
            />

          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-300 px-5 py-4">

            <div>

              <h4 className="font-semibold">
                Emergency Support
              </h4>

              <p className="text-sm text-slate-500">
                Allow customers to request emergency assistance.
              </p>

            </div>

            <input
              type="checkbox"
              checked={formData.emergencySupport}
              onChange={(e) =>
                updateField("emergencySupport", e.target.checked)
              }
              className="h-5 w-5"
            />

          </div>

        </div>

      </div>

      {/* Navigation */}

      <div className="flex items-center justify-between pt-2">

        <button
          type="button"
          onClick={previousStep}
          className="rounded-xl border border-slate-300 px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Previous
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Save & Continue →
        </button>

      </div>

    </form>
  );
}