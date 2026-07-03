import React, { useState } from "react";

const steps = [
  "Business Information",
  "Business Details",
  "Workflow & Services",
  "Availability",
  "Review & Submit",
];

const ProgressBar = ({ currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 w-full">
      <div className="flex justify-between items-start relative w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber);

          return (
            <div 
              key={index} 
              className="relative flex flex-col items-center flex-1 group cursor-pointer"
              onClick={() => onStepClick(stepNumber)}
            >
              {/* Connecting Line (Absolute positioned behind circles) */}
              {index !== steps.length - 1 && (
                <div 
                  className={`absolute top-5 left-[50%] w-full h-1 transition-colors duration-500 z-0
                  ${isCompleted ? "bg-green-500" : "bg-slate-200"}`}
                ></div>
              )}

              {/* Step Circle */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-50"
                      : isCompleted
                      ? "bg-green-500 text-white shadow-md shadow-green-200"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
              >
                {stepNumber}
              </div>

              {/* Step Label */}
              <p 
                className={`text-xs md:text-sm mt-3 text-center px-1 md:px-2 transition-colors duration-300
                  ${
                    isActive 
                      ? "text-slate-800 font-semibold" 
                      : isCompleted
                      ? "text-slate-700 font-medium"
                      : "text-slate-400 font-medium group-hover:text-slate-600"
                  }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const categories = [
  "Clinic", "Hospital", "Salon", "Spa", "Gym", "Restaurant", 
  "Cafe", "Education", "Consultancy", "Legal", "Automobile", "Other",
];

const businessTypes = [
  "Sole Proprietorship", "Partnership", "Private Limited", 
  "LLP", "NGO", "Government",
];

const BusinessInfoStep = ({ formData, updateField, nextStep }) => {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Strict Validation Logic
    const newErrors = {};
    if (!formData.businessName) newErrors.businessName = "Business Name is required";
    if (!formData.ownerName) newErrors.ownerName = "Owner Name is required";
    if (!formData.businessEmail) newErrors.businessEmail = "Business Email is required";
    if (!formData.businessPhone) newErrors.businessPhone = "Business Phone is required";

    // If there are errors, stop and show them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    // If everything is filled, clear errors and proceed
    setErrors({});
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Business Information</h2>
        <p className="mt-2 text-slate-500">
          Tell us about your business. These details will be visible to your customers and help them discover your services.
        </p>
      </div>

      {/* Basic Details */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
        <h3 className="text-lg font-semibold mb-6">Basic Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Business Name *</label>
            <input
              type="text"
              value={formData.businessName || ""}
              onChange={(e) => {
                updateField("businessName", e.target.value);
                if (errors.businessName) setErrors({ ...errors, businessName: null });
              }}
              placeholder="ABC Healthcare"
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.businessName ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.businessName && <p className="text-red-500 text-xs mt-2 font-medium">{errors.businessName}</p>}
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Owner Name *</label>
            <input
              type="text"
              value={formData.ownerName || ""}
              onChange={(e) => {
                updateField("ownerName", e.target.value);
                if (errors.ownerName) setErrors({ ...errors, ownerName: null });
              }}
              placeholder="John Doe"
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.ownerName ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.ownerName && <p className="text-red-500 text-xs mt-2 font-medium">{errors.ownerName}</p>}
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Business Email *</label>
            <input
              type="email"
              value={formData.businessEmail || ""}
              onChange={(e) => {
                updateField("businessEmail", e.target.value);
                if (errors.businessEmail) setErrors({ ...errors, businessEmail: null });
              }}
              placeholder="business@email.com"
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.businessEmail ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.businessEmail && <p className="text-red-500 text-xs mt-2 font-medium">{errors.businessEmail}</p>}
          </div>

          {/* Business Phone */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Business Phone *</label>
            <input
              type="tel"
              value={formData.businessPhone || ""}
              onChange={(e) => {
                updateField("businessPhone", e.target.value);
                if (errors.businessPhone) setErrors({ ...errors, businessPhone: null });
              }}
              placeholder="+91 9876543210"
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.businessPhone ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.businessPhone && <p className="text-red-500 text-xs mt-2 font-medium">{errors.businessPhone}</p>}
          </div>

          {/* WhatsApp Number (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">WhatsApp Number</label>
            <input
              type="tel"
              value={formData.whatsappNumber || ""}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Website (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Website</label>
            <input
              type="url"
              value={formData.website || ""}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://yourbusiness.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>

        </div>
      </div>

      {/* Category */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
        <h3 className="text-lg font-semibold mb-5">Business Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => updateField("businessCategory", category)}
              className={`rounded-xl border p-4 text-center transition-all shadow-sm
              ${
                formData.businessCategory === category
                  ? "border-blue-600 bg-blue-600 text-white font-semibold shadow-md shadow-blue-200 ring-2 ring-blue-100"
                  : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 text-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Business Type */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
        <h3 className="text-lg font-semibold mb-5">Business Type</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {businessTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => updateField("businessType", type)}
              className={`rounded-xl border p-4 text-center transition-all shadow-sm
              ${
                formData.businessType === type
                  ? "border-blue-600 bg-blue-600 text-white font-semibold shadow-md shadow-blue-200 ring-2 ring-blue-100"
                  : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 text-slate-700"
              }`}
            >
              {type}
            </button>
          ))}      
        </div>
      </div>

      {/* Registration Details */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
        <h3 className="text-lg font-semibold mb-6">Registration Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Business Registration Number</label>
            <input
              type="text"
              value={formData.registrationNumber || ""}
              onChange={(e) => updateField("registrationNumber", e.target.value)}
              placeholder="Registration Number"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber || ""}
              onChange={(e) => updateField("gstNumber", e.target.value)}
              placeholder="22AAAAA0000A1Z5"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
        <h3 className="text-lg font-semibold mb-6">Business Logo</h3>
        <label
          htmlFor="logoUpload"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 transition hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="text-5xl mb-4">📁</div>
          <p className="font-semibold text-slate-700">Click to upload your logo</p>
          <p className="mt-2 text-sm text-slate-500">PNG, JPG or SVG (Maximum 5 MB)</p>
          {formData.logo && (
            <p className="mt-4 text-sm font-medium text-green-600">Selected: {formData.logo.name}</p>
          )}
        </label>
        <input
          id="logoUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => updateField("logo", e.target.files[0])}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg"
        >
          Save & Continue →
        </button>
      </div>
    </form>
  );
};

const languageOptions = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada"];

const BusinessDetailStep = ({ formData, updateField, previousStep, nextStep }) => {
  const toggleLanguage = (language) => {
    const selected = formData.languages || [];
    if (selected.includes(language)) {
      updateField("languages", selected.filter((item) => item !== language));
    } else {
      updateField("languages", [...selected, language]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-8 lg:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Business Details</h2>
        <p className="mt-2 text-slate-500">Help customers find and learn more about your business.</p>
      </div>

      {/* Address */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold">Business Address</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Address Line 1 *</label>
            <input type="text" value={formData.address1 || ""} onChange={(e) => updateField("address1", e.target.value)} placeholder="Street address" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Address Line 2</label>
            <input type="text" value={formData.address2 || ""} onChange={(e) => updateField("address2", e.target.value)} placeholder="Apartment, Suite, Building..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Landmark</label>
            <input type="text" value={formData.landmark || ""} onChange={(e) => updateField("landmark", e.target.value)} placeholder="Nearby landmark" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">City *</label>
            <input type="text" value={formData.city || ""} onChange={(e) => updateField("city", e.target.value)} placeholder="City" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">State *</label>
            <input type="text" value={formData.state || ""} onChange={(e) => updateField("state", e.target.value)} placeholder="State" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Pincode *</label>
            <input type="text" value={formData.pincode || ""} onChange={(e) => updateField("pincode", e.target.value)} placeholder="700001" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Business Profile */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold">Business Profile</h3>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Business Description</label>
            <textarea rows={5} value={formData.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your business, services, experience and specialties..." className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none resize-none" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Established Year</label>
              <input type="number" value={formData.establishedYear || ""} onChange={(e) => updateField("establishedYear", e.target.value)} placeholder="2020" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Number of Employees</label>
              <input type="number" value={formData.employees || ""} onChange={(e) => updateField("employees", e.target.value)} placeholder="25" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium">Languages Spoken</label>
            <div className="flex flex-wrap gap-3">
              {languageOptions.map((language) => {
                const selected = formData.languages?.includes(language);
                return (
                  <button key={language} type="button" onClick={() => toggleLanguage(language)} className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"}`}>
                    {language}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={previousStep} className="rounded-xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
          ← Previous
        </button>
        <button type="submit" className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg">
          Save & Continue →
        </button>
      </div>
    </form>
  );
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1); 
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Only mark as completed if we are officially submitting the current step
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }
    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-8">
        
        {/* Sidebar / Branding area */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-4">🏪</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Grow Your Business</h2>
          <p className="text-sm text-slate-500 mb-6">Partner with us and manage appointments, queues and customers easily.</p>
          <ul className="space-y-4 text-sm text-slate-600">
            <li className="flex items-center gap-2">✅ Increase customer satisfaction</li>
            <li className="flex items-center gap-2">⏱️ Reduce waiting time</li>
            <li className="flex items-center gap-2">📅 Smart scheduling</li>
            <li className="flex items-center gap-2">📊 Real-time analytics</li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-full">
          <ProgressBar 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
            onStepClick={setCurrentStep} 
          />
          
          <div className="transition-all w-full">
            {currentStep === 1 && (
              <BusinessInfoStep 
                formData={formData} 
                updateField={updateField} 
                nextStep={handleNext} 
              />
            )}
            
            {currentStep === 2 && (
              <BusinessDetailStep 
                formData={formData} 
                updateField={updateField} 
                previousStep={handleBack}
                nextStep={handleNext} 
              />
            )}

            {currentStep > 2 && (
              <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{steps[currentStep - 1]}</h3>
                <p className="text-slate-500 mb-6">You've reached step {currentStep}. Form component goes here!</p>
                <button onClick={handleBack} className="px-6 py-2 border rounded-lg hover:bg-slate-50">Go Back</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}