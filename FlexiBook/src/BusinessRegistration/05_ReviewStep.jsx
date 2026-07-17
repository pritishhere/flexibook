import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const BusinessDetailStep = ({ formData = {}, updateField, previousStep, nextStep }) => {
  const [errors, setErrors] = useState({});

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
    
    // Strict Validation Logic for Step 2
    const newErrors = {};
    if (!formData.address1) newErrors.address1 = "Address Line 1 is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";

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
    <form onSubmit={handleSubmit} className="space-y-8 p-8 lg:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Business Details</h2>
        <p className="mt-2 text-slate-500">Help customers find and learn more about your business.</p>
      </div>

      {/* Address */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Business Address</h3>
        <div className="grid gap-6 md:grid-cols-2">
          
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Address Line 1 *</label>
            <input 
              type="text" 
              value={formData.address1 || ""} 
              onChange={(e) => {
                updateField("address1", e.target.value);
                if (errors.address1) setErrors({ ...errors, address1: null });
              }} 
              placeholder="Street address" 
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.address1 ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.address1 && <p className="text-red-500 text-xs mt-2 font-medium">{errors.address1}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Address Line 2</label>
            <input 
              type="text" 
              value={formData.address2 || ""} 
              onChange={(e) => updateField("address2", e.target.value)} 
              placeholder="Apartment, Suite, Building..." 
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" 
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Landmark</label>
            <input 
              type="text" 
              value={formData.landmark || ""} 
              onChange={(e) => updateField("landmark", e.target.value)} 
              placeholder="Nearby landmark" 
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" 
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">City *</label>
            <input 
              type="text" 
              value={formData.city || ""} 
              onChange={(e) => {
                updateField("city", e.target.value);
                if (errors.city) setErrors({ ...errors, city: null });
              }} 
              placeholder="City" 
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.city ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.city && <p className="text-red-500 text-xs mt-2 font-medium">{errors.city}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">State *</label>
            <input 
              type="text" 
              value={formData.state || ""} 
              onChange={(e) => {
                updateField("state", e.target.value);
                if (errors.state) setErrors({ ...errors, state: null });
              }} 
              placeholder="State" 
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.state ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.state && <p className="text-red-500 text-xs mt-2 font-medium">{errors.state}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Pincode *</label>
            <input 
              type="text" 
              value={formData.pincode || ""} 
              onChange={(e) => {
                updateField("pincode", e.target.value);
                if (errors.pincode) setErrors({ ...errors, pincode: null });
              }} 
              placeholder="700001" 
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.pincode ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-2 font-medium">{errors.pincode}</p>}
          </div>

        </div>
      </div>

      {/* Business Profile */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Business Profile</h3>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Business Description</label>
            <textarea 
              rows={5} 
              value={formData.description || ""} 
              onChange={(e) => updateField("description", e.target.value)} 
              placeholder="Describe your business, services, experience and specialties..." 
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none resize-y" 
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Established Year</label>
              <input 
                type="number" 
                value={formData.establishedYear || ""} 
                onChange={(e) => updateField("establishedYear", e.target.value)} 
                placeholder="2020" 
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Number of Employees</label>
              <input 
                type="number" 
                value={formData.employees || ""} 
                onChange={(e) => updateField("employees", e.target.value)} 
                placeholder="25" 
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Languages Spoken</label>
            <div className="flex flex-wrap gap-3">
              {languageOptions.map((language) => {
                const selected = formData.languages?.includes(language);
                return (
                  <button 
                    key={language} 
                    type="button" 
                    onClick={() => toggleLanguage(language)} 
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"}`}
                  >
                    {language}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-2 gap-4">
        <button 
          type="button" 
          onClick={previousStep} 
          className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Previous
        </button>
        <button 
          type="submit" 
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg"
        >
          Save & Continue →
        </button>
      </div>
    </form>
  );
};

const servicesList = [
  "Consultation", "General Checkup", "Repair Service", "Home Visit", 
  "Installation", "Training", "Maintenance", "Customer Support",
];

const serviceModes = ["On-site", "Online", "Home Visit"];

const paymentOptions = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking"];

const ServicesStep = ({ formData = {}, updateField, previousStep, nextStep }) => {
  const [errors, setErrors] = useState({});

  const toggleSelection = (field, value) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      updateField(field, current.filter((item) => item !== value));
    } else {
      updateField(field, [...current, value]);
      // Clear error if user selects an option
      if (errors[field]) setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.services || formData.services.length === 0) newErrors.services = "Please select at least one service.";
    if (!formData.serviceMode || formData.serviceMode.length === 0) newErrors.serviceMode = "Please select at least one service mode.";
    if (!formData.slotDuration) newErrors.slotDuration = "Slot duration is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; 
    }

    setErrors({});
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-8 lg:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Services & Workflow</h2>
        <p className="mt-2 text-slate-500">
          Tell customers what services you offer and how appointments are managed.
        </p>
      </div>

      {/* Services */}
      <div className={`rounded-2xl border p-6 transition-colors duration-300 ${errors.services ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50/50"}`}>
        <h3 className="mb-5 text-lg font-semibold text-slate-800">Services Offered *</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicesList.map((service) => {
            const selected = formData.services?.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleSelection("services", service)}
                className={`rounded-xl border p-4 text-center transition-all shadow-sm
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white font-semibold shadow-md shadow-blue-200 ring-2 ring-blue-100"
                    : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 text-slate-700"
                }`}
              >
                {service}
              </button>
            );
          })}
        </div>
        {errors.services && <p className="text-red-500 text-xs mt-3 font-medium">{errors.services}</p>}
      </div>

      {/* Service Mode */}
      <div className={`rounded-2xl border p-6 transition-colors duration-300 ${errors.serviceMode ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50/50"}`}>
        <h3 className="mb-5 text-lg font-semibold text-slate-800">Service Mode *</h3>
        <div className="flex flex-wrap gap-4">
          {serviceModes.map((mode) => {
            const selected = formData.serviceMode?.includes(mode);
            return (
              <button
                key={mode}
                type="button"
                onClick={() => toggleSelection("serviceMode", mode)}
                className={`rounded-full px-6 py-3 border transition-all text-sm font-medium
                ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
        {errors.serviceMode && <p className="text-red-500 text-xs mt-3 font-medium">{errors.serviceMode}</p>}
      </div>

      {/* Pricing & Payment */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Pricing & Payments</h3>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Average Service Price</label>
            <input
              type="number"
              value={formData.averagePrice || ""}
              onChange={(e) => updateField("averagePrice", e.target.value)}
              placeholder="500"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-5 py-4">
            <div>
              <h4 className="font-semibold text-slate-800">GST Registered</h4>
              <p className="text-sm text-slate-500">Enable if your business is GST registered.</p>
            </div>
            <input
              type="checkbox"
              checked={formData.gstRegistered || false}
              onChange={(e) => updateField("gstRegistered", e.target.checked)}
              className="h-5 w-5 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        <h4 className="mb-4 text-sm font-semibold text-slate-800">Accepted Payment Methods</h4>
        <div className="flex flex-wrap gap-3">
          {paymentOptions.map((payment) => {
            const selected = formData.paymentMethods?.includes(payment);
            return (
              <button
                key={payment}
                type="button"
                onClick={() => toggleSelection("paymentMethods", payment)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-all
                ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {payment}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointment Settings */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Appointment Settings</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Appointment Slot Duration (minutes) *</label>
            <input
              type="number"
              value={formData.slotDuration || ""}
              onChange={(e) => {
                updateField("slotDuration", e.target.value);
                if (errors.slotDuration) setErrors({ ...errors, slotDuration: null });
              }}
              placeholder="30"
              className={`w-full rounded-xl border px-4 py-3 focus:outline-none transition-colors
                ${errors.slotDuration ? "border-red-500 focus:border-red-600 bg-red-50" : "border-slate-300 focus:border-blue-600 bg-white"}`}
            />
            {errors.slotDuration && <p className="text-red-500 text-xs mt-2 font-medium">{errors.slotDuration}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Buffer Time (minutes)</label>
            <input
              type="number"
              value={formData.bufferTime || ""}
              onChange={(e) => updateField("bufferTime", e.target.value)}
              placeholder="10"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-2 gap-4">
        <button
          type="button"
          onClick={previousStep}
          className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Previous
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg"
        >
          Save & Continue →
        </button>
      </div>
    </form>
  );
};

function ReviewItem({ title, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 font-semibold text-slate-800 break-words">{value || "-"}</p>
    </div>
  );
}

const ReviewStep = ({ formData = {}, updateField, previousStep, nextStep }) => {
  const [errors, setErrors] = useState({});
const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      setErrors({ termsAccepted: "You must confirm that the information is correct to proceed." });
      return;
    }
    
    setErrors({});
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      
      const res = await fetch(`${API_BASE_URL}/hospitals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
       body: JSON.stringify({
  businessName: formData.businessName,
  ownerName: formData.ownerName,
  businessEmail: formData.businessEmail,
  businessPhone: formData.businessPhone,
  whatsappNumber: formData.whatsappNumber,

  businessCategory: formData.businessCategory,
  businessType: formData.businessType,
  registrationNumber: formData.registrationNumber,
  gstNumber: formData.gstNumber,
  website: formData.website,
  logo: formData.logo,

  address1: formData.address1,
  address2: formData.address2,
  landmark: formData.landmark,
  city: formData.city,
  state: formData.state,
  pincode: formData.pincode,
  description: formData.description,
  establishedYear: formData.establishedYear,
  employees: formData.employees,
  languages: formData.languages,

  services: formData.services,
  serviceMode: formData.serviceMode,
  averagePrice: formData.averagePrice,
  gstRegistered: formData.gstRegistered,
  paymentMethods: formData.paymentMethods,
  slotDuration: formData.slotDuration,
  bufferTime: formData.bufferTime,

  workingDays: formData.workingDays,
  openTime: formData.openTime,
  closeTime: formData.closeTime,
  lunchBreak: formData.lunchBreak,
  appointmentRequired: formData.appointmentRequired,
  emergencySupport: formData.emergencySupport
})
      });
      
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ submit: data.message || "Failed to submit registration. Please make sure you are logged in as a Business Owner." });
        setIsLoading(false);
        return;
      }

      alert("Business Registered Successfully!");
      navigate('/business/dashboard');
    } catch (err) {
      console.error('Registration submit error:', err);
      setErrors({ submit: 'Failed to connect to server. Please try again.' });
      setIsLoading(false);
    }
  };

  const yesNo = (value) => (value ? "Yes" : "No");

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-8 lg:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Review & Submit</h2>
        <p className="mt-2 text-slate-500">Please review your business information before submitting.</p>
      </div>

      {/* Basic Information */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Business Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
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

      {/* Address & Details */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Business Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <ReviewItem title="Description" value={formData.description} />
          </div>
          <ReviewItem title="Address Line 1" value={formData.address1} />
          <ReviewItem title="Address Line 2" value={formData.address2} />
          <ReviewItem title="Landmark" value={formData.landmark} />
          <ReviewItem title="City" value={formData.city} />
          <ReviewItem title="State" value={formData.state} />
          <ReviewItem title="Pincode" value={formData.pincode} />
          <ReviewItem title="Established Year" value={formData.establishedYear} />
          <ReviewItem title="Employees" value={formData.employees} />
          <div className="md:col-span-2">
            <ReviewItem title="Languages Spoken" value={formData.languages?.join(", ")} />
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Services & Pricing</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <ReviewItem title="Services Offered" value={formData.services?.join(", ")} />
          </div>
          <ReviewItem title="Service Modes" value={formData.serviceMode?.join(", ")} />
          <ReviewItem title="Average Price" value={formData.averagePrice ? `₹ ${formData.averagePrice}` : null} />
          <ReviewItem title="GST Registered" value={yesNo(formData.gstRegistered)} />
          <ReviewItem title="Payment Methods" value={formData.paymentMethods?.join(", ")} />
          <ReviewItem title="Slot Duration" value={formData.slotDuration ? `${formData.slotDuration} mins` : null} />
          <ReviewItem title="Buffer Time" value={formData.bufferTime ? `${formData.bufferTime} mins` : null} />
        </div>
      </div>

      {/* Availability */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">Availability & Settings</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <ReviewItem title="Working Days" value={formData.workingDays?.join(", ")} />
          </div>
          <ReviewItem title="Opening Time" value={formData.openTime} />
          <ReviewItem title="Closing Time" value={formData.closeTime} />
          <ReviewItem title="Lunch Break" value={formData.lunchBreak} />
          <ReviewItem title="Appointment Required" value={yesNo(formData.appointmentRequired)} />
          <ReviewItem title="Emergency Support" value={yesNo(formData.emergencySupport)} />
        </div>
      </div>

      {/* Terms */}
      <div className={`rounded-xl border p-6 transition-colors duration-300 ${errors.termsAccepted ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50/50"}`}>
        <label className="flex items-start sm:items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted || false}
            onChange={(e) => {
              updateField("termsAccepted", e.target.checked);
              if (errors.termsAccepted) setErrors({});
            }}
            className="h-5 w-5 mt-1 sm:mt-0 accent-green-600 cursor-pointer rounded"
          />
          <span className="text-slate-700 font-medium">
            I confirm that all the provided information is correct and I accept the terms and conditions.
          </span>
        </label>
        {errors.termsAccepted && <p className="text-red-500 text-sm mt-3 font-medium ml-8">{errors.termsAccepted}</p>}
      </div>

      {errors.submit && (
        <p className="text-red-500 text-sm font-bold bg-red-50 border border-red-200 p-4 rounded-xl">
          ⚠️ {errors.submit}
        </p>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-2 gap-4">
        <button
          type="button"
          onClick={previousStep}
          disabled={isLoading}
          className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto rounded-xl bg-green-600 px-8 py-3 font-semibold text-white shadow-md shadow-green-200 transition-all hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Registration ✓"
          )}
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
}