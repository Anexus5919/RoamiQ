// /app/components/TravelAnalysisDisplay.jsx
export default function TravelAnalysisDisplay({ analysis }) {
  if (!analysis) return null;

  return (
    // Background adjusted slightly for dark mode
    <div className="p-4 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-400 dark:border-blue-600 rounded-r-lg shadow-md">
      {/* Title color adjusted */}
      <h4 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">Travel Logistics</h4>

      {/* Summary text color adjusted */}
      <p className="italic text-blue-700 dark:text-blue-300 text-sm mt-1">
        {analysis.summary}
      </p>

      {/* Main text colors adjusted */}
      <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p>
          <strong className="font-medium text-gray-900 dark:text-gray-100">Distance:</strong> {analysis.distance}
        </p>

        <div className="font-medium text-gray-900 dark:text-gray-100">Options:</div>
        <ul className="list-disc list-inside pl-4 space-y-1">
          {analysis.options && analysis.options.map((option, index) => (
            // List item text color adjusted
            <li key={index} className="dark:text-gray-300">
              <strong>{option.mode}:</strong> {option.time}
              {option.distance && ` (${option.distance})`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}