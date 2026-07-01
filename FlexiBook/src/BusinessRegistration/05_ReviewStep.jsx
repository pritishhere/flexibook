import React from "react";

export default function ReviewStep({
  formData,
  previousStep,
}) {

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Business Registered Successfully!");
    console.log(formData);
  };

  const yesNo = (value) => (value ? "Yes" : "No");

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-8 lg:p-10"
    >

      {/* Heading */}

      <div>

        <h2 className="text-3xl font-bold text-slate-900">
          Review & Submit
        </h2>

        <p className="mt-2 text-slate-500">
          Please review your business information before submitting.
        </p>

      </div>

      {/* Basic Information */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Business Information
        </h3>

        <div className="grid gap-5 md:grid-cols-2">

          <ReviewItem title="Business Name" value={formData.businessName} />
          <ReviewItem title="Owner Name" value={formData.ownerName} />
          <ReviewItem title="Email" value={formData.businessEmail} />
          <ReviewItem title="Phone" value={formData.businessPhone} />
          <ReviewItem title="WhatsApp" value={formData.whatsappNumber} />
          <ReviewItem title="Website" value={formData.website} />
          <ReviewItem title="Category" value={formData.businessCategory} />
          <ReviewItem title="Business Type" value={formData.businessType} />
          <ReviewItem title="Registration No." value={formData.registrationNumber} />
          <ReviewItem title="GST Number" value={formData.gstNumber} />

        </div>

      </div>

      {/* Address */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Business Details
        </h3>

        <div className="grid gap-5 md:grid-cols-2">

          <ReviewItem title="Address Line 1" value={formData.address1} />
          <ReviewItem title="Address Line 2" value={formData.address2} />
          <ReviewItem title="Landmark" value={formData.landmark} />
          <ReviewItem title="City" value={formData.city} />
          <ReviewItem title="State" value={formData.state} />
          <ReviewItem title="Pincode" value={formData.pincode} />
          <ReviewItem title="Established Year" value={formData.establishedYear} />
          <ReviewItem title="Employees" value={formData.employees} />
          <ReviewItem
            title="Languages"
            value={formData.languages?.join(", ")}
          />

        </div>

      </div>

      {/* Services */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Services
        </h3>

        <div className="grid gap-5 md:grid-cols-2">

          <ReviewItem
            title="Services"
            value={formData.services?.join(", ")}
          />

          <ReviewItem
            title="Service Mode"
            value={formData.serviceMode?.join(", ")}
          />

          <ReviewItem
            title="Average Price"
            value={`₹ ${formData.averagePrice}`}
          />

          <ReviewItem
            title="GST Registered"
            value={yesNo(formData.gstRegistered)}
          />

          <ReviewItem
            title="Payment Methods"
            value={formData.paymentMethods?.join(", ")}
          />

          <ReviewItem
            title="Slot Duration"
            value={`${formData.slotDuration} mins`}
          />

          <ReviewItem
            title="Buffer Time"
            value={`${formData.bufferTime} mins`}
          />

        </div>

      </div>

      {/* Availability */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">

        <h3 className="mb-5 text-lg font-semibold">
          Availability
        </h3>

        <div className="grid gap-5 md:grid-cols-2">

          <ReviewItem
            title="Working Days"
            value={formData.workingDays?.join(", ")}
          />

          <ReviewItem
            title="Opening Time"
            value={formData.openTime}
          />

          <ReviewItem
            title="Closing Time"
            value={formData.closeTime}
          />

          <ReviewItem
            title="Lunch Break"
            value={formData.lunchBreak}
          />

          <ReviewItem
            title="Appointment Required"
            value={yesNo(formData.appointmentRequired)}
          />

          <ReviewItem
            title="Emergency Support"
            value={yesNo(formData.emergencySupport)}
          />

        </div>

      </div>

      {/* Terms */}

      <div className="rounded-xl border border-slate-200 bg-white p-6">

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={formData.termsAccepted}
            readOnly
          />

          <span>
            I confirm that all the provided information is correct.
          </span>

        </label>

      </div>

      {/* Navigation */}

      <div className="flex items-center justify-between">

        <button
          type="button"
          onClick={previousStep}
          className="rounded-xl border border-slate-300 px-8 py-3 font-semibold hover:bg-slate-100"
        >
          ← Previous
        </button>

        <button
          type="submit"
          className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700"
        >
          Submit Registration
        </button>

      </div>

    </form>
  );
}

function ReviewItem({ title, value }) {

  return (
    <div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value || "-"}
      </p>

    </div>
  );

}