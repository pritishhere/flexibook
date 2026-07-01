import React from "react";

const languageOptions = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
];

export default function BusinessDetailStep({
  formData = {}, // Default fallback to empty object to prevent undefined errors
  updateField,
  previousStep,
  nextStep,
}) {
  const toggleLanguage = (language) => {
    const selected = formData.languages || [];

    if (selected.includes(language)) {
      updateField(
        "languages",
        selected.filter((item) => item !== language)
      );
    } else {
      updateField("languages", [...selected, language]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-10">
      
      {}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Business Details
        </h2>
        <p className="mt-2 text-slate-500">
          Help customers find and learn more about your business.
        </p>
      </div>

      {}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">
          Business Address
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={formData.address1 || ""}
              onChange={(e) => updateField("address1", e.target.value)}
              placeholder="Street address"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.address2 || ""}
              onChange={(e) => updateField("address2", e.target.value)}
              placeholder="Apartment, Suite, Building..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Landmark
            </label>
            <input
              type="text"
              value={formData.landmark || ""}
              onChange={(e) => updateField("landmark", e.target.value)}
              placeholder="Nearby landmark"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              State *
            </label>
            <input
              type="text"
              required
              value={formData.state || ""}
              onChange={(e) => updateField("state", e.target.value)}
              placeholder="State"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Pincode *
            </label>
            <input
              type="text"
              required
              value={formData.pincode || ""}
              onChange={(e) => updateField("pincode", e.target.value)}
              placeholder="700001"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">
          Business Profile
        </h3>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Description
            </label>
            <textarea
              rows={5}
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe your business, services, experience and specialties..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-y"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Established Year
              </label>
              <input
                type="number"
                value={formData.establishedYear || ""}
                onChange={(e) => updateField("establishedYear", e.target.value)}
                placeholder="2020"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Number of Employees
              </label>
              <input
                type="number"
                value={formData.employees || ""}
                onChange={(e) => updateField("employees", e.target.value)}
                placeholder="25"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div> 
          
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
              Languages Spoken
            </label>
            <div className="flex flex-wrap gap-3">
              {languageOptions.map((language) => {
                const selected = formData.languages?.includes(language);

                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleLanguage(language)}
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
                    }`}
                  >
                    {language}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-2 gap-4">
        <button
          type="button"
          onClick={previousStep}
          className="w-full sm:w-auto rounded-xl border border-slate-300 px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Previous
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-200"
        >
          Save & Continue →
        </button>
      </div>
    </form>
  );
}