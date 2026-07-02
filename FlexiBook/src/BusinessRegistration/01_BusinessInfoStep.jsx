import React from "react";

const categories = [
  "Clinic",
  "Hospital",
  "Salon",
  "Spa",
  "Gym",
  "Restaurant",
  "Cafe",
  "Education",
  "Consultancy",
  "Legal",
  "Automobile",
  "Other",
];

const businessTypes = [
  "Sole Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "NGO",
  "Government",
];

export default function BusinessInfoStep({
  formData,
  updateField,
  nextStep,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation can be added later

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-10">

      {/* Heading */}

      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Business Information
        </h2>

        <p className="mt-2 text-slate-500">
          Tell us about your business. These details will be visible to your
          customers and help them discover your services.
        </p>
      </div>

      {/* Basic Details */}

      <div className="rounded-2xl border border-slate-200 p-6 bg-white">

        <h3 className="text-lg font-semibold mb-6">
          Basic Information
        </h3>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-2">
              Business Name *
            </label>

            <input
              type="text"
              value={formData.businessName}
              onChange={(e) =>
                updateField("businessName", e.target.value)
              }
              placeholder="ABC Healthcare"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Owner Name *
            </label>

            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) =>
                updateField("ownerName", e.target.value)
              }
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Business Email *
            </label>

            <input
              type="email"
              value={formData.businessEmail}
              onChange={(e) =>
                updateField("businessEmail", e.target.value)
              }
              placeholder="business@email.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Business Phone *
            </label>

            <input
              type="tel"
              value={formData.businessPhone}
              onChange={(e) =>
                updateField("businessPhone", e.target.value)
              }
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              WhatsApp Number
            </label>

            <input
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) =>
                updateField("whatsappNumber", e.target.value)
              }
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Website
            </label>

            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                updateField("website", e.target.value)
              }
              placeholder="https://yourbusiness.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* Category */}

      <div className="rounded-2xl border border-slate-200 p-6">

        <h3 className="text-lg font-semibold mb-5">
          Business Category
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() =>
                updateField("businessCategory", category)
              }
              className={`rounded-xl border p-4 text-center transition-all
              ${
                formData.businessCategory === category
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-slate-300 hover:border-blue-400"
              }`}
            >
              {category}
            </button>
          ))}
    </div>

      </div>

      {/* Business Type */}

      <div className="rounded-2xl border border-slate-200 p-6">

        <h3 className="text-lg font-semibold mb-5">
          Business Type
        </h3>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          {businessTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() =>
                updateField("businessType", type)
              }
              className={`rounded-xl border p-4 transition-all
              ${
                formData.businessType === type
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-slate-300 hover:border-blue-400"
              }`}
            >
              {type}
            </button>
          ))}      
        </div>

    </div>

      {/* Registration Details */}

      <div className="rounded-2xl border border-slate-200 p-6 bg-white">

        <h3 className="text-lg font-semibold mb-6">
          Registration Details
        </h3>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="block text-sm font-medium mb-2">
              Business Registration Number
            </label>

            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) =>
                updateField("registrationNumber", e.target.value)
              }
              placeholder="Registration Number"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              GST Number
            </label>

            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) =>
                updateField("gstNumber", e.target.value)
              }
              placeholder="22AAAAA0000A1Z5"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

        </div>

      </div>

      {/* Logo Upload */}

      <div className="rounded-2xl border border-slate-200 p-6 bg-white">

        <h3 className="text-lg font-semibold mb-6">
          Business Logo
        </h3>

        <label
          htmlFor="logoUpload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-10 transition hover:border-blue-500 hover:bg-blue-50"
        >

          <div className="text-5xl mb-4">
            📁
          </div>

          <p className="font-semibold text-slate-700">
            Click to upload your logo
          </p>

          <p className="mt-2 text-sm text-slate-500">
            PNG, JPG or SVG (Maximum 5 MB)
          </p>

          {formData.logo && (
            <p className="mt-4 text-sm font-medium text-green-600">
              Selected: {formData.logo.name}
            </p>
          )}

        </label>

        <input
          id="logoUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            updateField("logo", e.target.files[0])
          }
        />

      </div>

      {/* Navigation */}

      <div className="flex justify-end pt-2">

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