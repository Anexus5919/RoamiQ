// /app/components/ChainOfThoughtDisplay.jsx
'use client';

import { CheckCircle, Loader2, Circle } from 'lucide-react';

// Helper component for the spinner
const Spinner = () => <Loader2 className="animate-spin text-blue-600" />;

// Helper component for status icons
const StatusIcon = ({ status }) => {
  if (status === 'loading') {
    return <Spinner />;
  }
  if (status === 'done') {
    return <CheckCircle className="text-green-500" />;
  }
  return <Circle className="text-gray-300" />;
};

export default function ChainOfThoughtDisplay({ steps, rawJson }) {
  return (
    <div className="bg-white p-6 rounded-lg items-center shadow-md mt-6 space-y-4">
      <h2 className="text-2xl font-bold text-indigo-700">
        Generating Your Itinerary...
      </h2>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <StatusIcon status={step.status} />
            <span className={`text-sm font-medium ${
              step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
            }`}>
              {step.text}
            </span>
          </div>
        ))}
      </div>

      {/* This is the dropdown for the raw JSON stream */}
      <details className="pt-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          View Raw AI Stream (for debugging)
        </summary>
        <div className="mt-2 bg-gray-900 text-white p-4 rounded-lg font-mono text-xs whitespace-pre-wrap overflow-x-auto">
          {rawJson || "Waiting for stream..."}
        </div>
      </details>
    </div>
  );
}