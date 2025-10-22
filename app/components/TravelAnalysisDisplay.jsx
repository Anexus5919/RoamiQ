// /app/components/TravelAnalysisDisplay.jsx

export default function TravelAnalysisDisplay({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
      {/* --- COLOR FIX --- */}
      <h4 className="text-xl font-semibold text-indigo-700">Travel Logistics</h4>
      
      <p className="italic text-blue-700 text-sm mt-1">
        {analysis.summary}
      </p>

      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <p>
          <strong className="font-medium text-gray-900">Distance:</strong> {analysis.distance}
        </p>
        
        <div className="font-medium text-gray-900">Options:</div>
        <ul className="list-disc list-inside pl-4 space-y-1">
          {analysis.options && analysis.options.map((option, index) => (
            <li key={index}>
              <strong>{option.mode}:</strong> {option.time}
              {option.distance && ` (${option.distance})`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}