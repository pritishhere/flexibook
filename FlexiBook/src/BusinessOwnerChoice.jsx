import React from "react";
import { useNavigate } from "react-router-dom";

const BusinessOwnerChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full text-center">

        <h1 className="text-3xl font-bold mb-4">
          Business Owner Portal
        </h1>

        <p className="text-gray-600 mb-8">
          Are you already a registered Business Owner?
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl mb-4"
        >
          ✅ Yes, I am
        </button>

        <button
          onClick={() =>
            navigate("/signup?role=business")
          }
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
        >
          ➕ No, Register Me
        </button>

      </div>
    </div>
  );
};

export default BusinessOwnerChoice;