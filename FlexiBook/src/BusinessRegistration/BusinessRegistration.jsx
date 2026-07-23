// src/BusinessRegistration/BusinessRegistration.jsx

import { useEffect, useMemo, useState } from "react";

import RegistrationHeader from "./RegistrationHeader";
import ProgressBar from "./ProgressBar";
import LeftPanel from "./LeftPanel";

import BusinessInfoStep from "./01_BusinessInfoStep";
import BusinessDetailStep from "./02_BusinessDetailStep";
import ServicesStep from "./03_ServicesStep";
import AvailabilityStep from "./04_AvailabilityStep";
import ReviewStep from "./05_ReviewStep";

const initialForm = {
  // Step 1
  businessName: "",
  ownerName: "",
  businessEmail: "",
  businessPhone: "",
  whatsappNumber: "",
  businessCategory: "",
  businessType: "",
  registrationNumber: "",
  gstNumber: "",
  website: "",
  logo: null,

  // Step 2
  address1: "",
  address2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  description: "",
  establishedYear: "",
  employees: "",
  languages: [],

  // Step 3
  services: [],
  serviceMode: [],
  averagePrice: "",
  gstRegistered: false,
  paymentMethods: [],
  slotDuration: "",
  bufferTime: "",

  // Step 4
  workingDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ],
  openTime: "09:00",
  closeTime: "18:00",
  lunchBreak: "",
  appointmentRequired: true,
  emergencySupport: false,

  // Step 5
  termsAccepted: false,
};

const steps = [
  {
    id: 1,
    title: "Business Info",
    subtitle: "Basic details",
  },
  {
    id: 2,
    title: "Business Details",
    subtitle: "Location & profile",
  },
  {
    id: 3,
    title: "Services",
    subtitle: "Offerings",
  },
  {
    id: 4,
    title: "Availability",
    subtitle: "Working schedule",
  },

  {
    id: 5,
    title: "Review",
    subtitle: "Confirmation",
  },
];

export default function BusinessRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    setFormData((prev) => ({
      ...prev,
      ownerName: user.name || "",
      businessEmail: user.email || "",
    }));
  }
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateForm = (values) => {
    setFormData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const completion = useMemo(() => {
    return Math.round((currentStep / steps.length) * 100);
  }, [currentStep]);

  const sharedProps = {
    formData,
    updateField,
    updateForm,
    nextStep,
    previousStep,
    goToStep,
    currentStep,
    totalSteps: steps.length,
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep {...sharedProps} />;

      case 2:
        return <BusinessDetailStep {...sharedProps} />;

      case 3:
        return <ServicesStep {...sharedProps} />;

      case 4:
        return <AvailabilityStep {...sharedProps} />;

      case 5:
        return <ReviewStep {...sharedProps} />;

      default:
        return <BusinessInfoStep {...sharedProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <RegistrationHeader />

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <LeftPanel
            steps={steps}
            currentStep={currentStep}
            completion={completion}
            formData={formData}
          />

          <div className="space-y-6">
            <ProgressBar
              steps={steps}
              currentStep={currentStep}
              completion={completion}
            />

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}