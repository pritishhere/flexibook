import React from "react";

const servicesList = [
  "Consultation",
  "General Checkup",
  "Repair Service",
  "Home Visit",
  "Installation",
  "Training",
  "Maintenance",
  "Customer Support",
];

const serviceModes = [
  "On-site",
  "Online",
  "Home Visit",
];

const paymentOptions = [
  "Cash",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking",
];

export default function ServicesStep({
  formData,
  updateField,
  previousStep,
  nextStep,
}) {

  const toggleSelection = (field, value) => {
    const current = formData[field] || [];

    if (current.includes(value)) {
      updateField(
        field,
        current.filter((item) => item !== value)
      );
    } else {
      updateField(field, [...current, value]);
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
          Services & Workflow
        </h2>

        <p className="mt-2 text-slate-500">
          Tell customers what services you offer and how appointments are managed.
        </p>
      </div>

      {/* Services */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Services Offered
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {servicesList.map((service) => {

            const selected =
              formData.services?.includes(service);

            return (
              <button
                key={service}
                type="button"
                onClick={() =>
                  toggleSelection("services", service)
                }
                className={`rounded-xl border p-4 transition-all
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 hover:border-blue-500"
                }`}
              >
                {service}
              </button>
            );
          })}

        </div>

      </div>

      {/* Service Mode */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Service Mode
        </h3>

        <div className="flex flex-wrap gap-4">

          {serviceModes.map((mode) => {

            const selected =
              formData.serviceMode?.includes(mode);

            return (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  toggleSelection("serviceMode", mode)
                }
                className={`rounded-full px-6 py-3 border transition-all
                ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-300 hover:border-blue-500"
                }`}
              >
                {mode}
              </button>
            );
          })}

        </div>

      </div>

      {/* Pricing */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-6 text-lg font-semibold">
          Pricing
        </h3>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Average Service Price
            </label>

            <input
              type="number"
              value={formData.averagePrice}
              onChange={(e) =>
                updateField("averagePrice", e.target.value)
              }
              placeholder="500"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-300 px-5 py-4">

            <div>

              <h4 className="font-semibold">
                GST Registered
              </h4>

              <p className="text-sm text-slate-500">
                Enable if your business is GST registered.
              </p>

            </div>

            <input
              type="checkbox"
              checked={formData.gstRegistered}
              onChange={(e) =>
                updateField("gstRegistered", e.target.checked)
              }
              className="h-5 w-5"
            />

          </div>

        </div>

      </div>
      {/* Payment Methods */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Accepted Payment Methods
        </h3>

        <div className="flex flex-wrap gap-4">

          {paymentOptions.map((payment) => {

            const selected =
              formData.paymentMethods?.includes(payment);

            return (
              <button
                key={payment}
                type="button"
                onClick={() =>
                  toggleSelection("paymentMethods", payment)
                }
                className={`rounded-full border px-5 py-3 transition-all
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 hover:border-blue-500"
                }`}
              >
                {payment}
              </button>
            );

          })}

        </div>

      </div>

      {/* Appointment Settings */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-6 text-lg font-semibold">
          Appointment Settings
        </h3>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium">
              Appointment Slot Duration (minutes)
            </label>

            <input
              type="number"
              value={formData.slotDuration}
              onChange={(e) =>
                updateField("slotDuration", e.target.value)
              }
              placeholder="30"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Buffer Time Between Appointments (minutes)
            </label>

            <input
              type="number"
              value={formData.bufferTime}
              onChange={(e) =>
                updateField("bufferTime", e.target.value)
              }
              placeholder="10"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
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