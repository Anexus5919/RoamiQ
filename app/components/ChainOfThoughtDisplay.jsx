// /app/components/ChainOfThoughtDisplay.jsx
'use client';

import { CheckCircle, Loader2, Circle } from 'lucide-react';

const Spinner = () => <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" />;
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
    // --- ADDED DARK MODE STYLES ---
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6 space-y-4">
      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
        Generating Your Itinerary...
      </h2>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <StatusIcon status={step.status} />
            <span className={`text-sm font-medium ${
              step.status === 'pending' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {step.text}
            </span>
          </div>
        ))}
      </div>

      <details className="pt-4">
        <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
          View Raw AI Stream (for debugging)
        </summary>
        <div className="mt-2 bg-gray-900 text-white p-4 rounded-lg font-mono text-xs whitespace-pre-wrap overflow-x-auto">
          {rawJson || "Waiting for stream..."}
        </div>
      </details>
    </div>
  );
}