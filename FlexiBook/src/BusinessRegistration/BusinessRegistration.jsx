import React, { useState } from "react";

import RegistrationHeader from "./RegistrationHeader";
import ProgressBar from "./ProgressBar";
import LeftPanel from "./LeftPanel";

const BusinessRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <RegistrationHeader />

        <ProgressBar currentStep={currentStep} />

        <div className="grid lg:grid-cols-4 gap-8">

          {/* Left Side */}
          <div className="lg:col-span-1">
            <LeftPanel />
          </div>

          {/* Right Side */}
          <div className="lg:col-span-3">

            <div className="bg-white rounded-2xl shadow-lg p-8">

              <h2 className="text-3xl font-bold mb-2">
                Step {currentStep}
              </h2>

              <p className="text-gray-500 mb-10">
                This area will display the form for each step.
              </p>

              <div className="flex justify-between">

                <button
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  ← Previous
                </button>

                <button
                  onClick={() => {
                    if (currentStep < 5)
                      setCurrentStep(currentStep + 1);
                  }}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save & Continue →
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BusinessRegistration;