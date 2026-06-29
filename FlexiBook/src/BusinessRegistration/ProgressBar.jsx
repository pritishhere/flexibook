import React from "react";

const steps = [
  "Business Information",
  "Business Details",
  "Workflow & Services",
  "Availability",
  "Review & Submit",
];

const ProgressBar = ({ currentStep }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex-1 flex items-center"
          >
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                  ${
                    currentStep === index + 1
                      ? "bg-blue-600 text-white"
                      : currentStep > index + 1
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
              >
                {index + 1}
              </div>

              <p className="text-xs md:text-sm mt-2 text-center text-gray-700">
                {step}
              </p>
            </div>

            {index !== steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded
                ${
                  currentStep > index + 1
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;