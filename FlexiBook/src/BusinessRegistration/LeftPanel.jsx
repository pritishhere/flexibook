import React from "react";

const LeftPanel = () => {
  return (
    <div className="bg-blue-50 rounded-2xl p-8 h-full border border-blue-100">

      <div className="text-6xl mb-6 text-center">
        🏪
      </div>

      <h2 className="text-3xl font-bold text-blue-700 mb-4">
        Grow Your Business
      </h2>

      <p className="text-gray-700 mb-8">
        Partner with us and manage appointments, queues and customers easily.
      </p>

      <ul className="space-y-4 text-gray-700">
        <li>✅ Increase customer satisfaction</li>
        <li>⏱ Reduce waiting time</li>
        <li>📅 Smart scheduling & queue management</li>
        <li>📊 Real-time analytics & insights</li>
        <li>🚀 Reach more customers</li>
      </ul>

      <div className="mt-10 bg-white rounded-xl p-5 shadow">
        <h3 className="font-bold mb-2">
          Need Help?
        </h3>

        <p className="text-sm text-gray-600 mb-3">
          Our team is here to help you.
        </p>

        <p className="text-blue-600">
          📧 business@flexibook.com
        </p>

        <p className="text-blue-600 mt-2">
          📞 +91 98765 43210
        </p>
      </div>

    </div>
  );
};

export default LeftPanel;