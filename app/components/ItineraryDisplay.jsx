// /app/components/ItineraryDisplay.jsx

export default function ItineraryDisplay({ itinerary }) {
  if (!itinerary) return null;

  const { destinationName, destinationSummary, thoughtProcess, days } = itinerary;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-4xl font-bold text-center text-indigo-700 dark:text-indigo-400">
        Your Trip to {destinationName}
      </h2>

      {destinationSummary && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">Trip Overview</h4>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>
              <strong className="text-gray-900 dark:text-gray-100">Best Time to Visit:</strong>
              <span className="ml-1">{destinationSummary.bestTimeToVisit}</span>
            </p>
          </div>
        </div>
      )}

      {thoughtProcess && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 rounded-r-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300">🤖 AI Planner's Thoughts:</h4>
          <p className="italic text-blue-700 dark:text-blue-400 text-sm mt-1">{thoughtProcess}</p>
        </div>
      )}

      <div className="space-y-4">
        {days && Array.isArray(days) && days.map((day, index) => ( // Add index here
          // --- THIS IS THE FIX ---
          // Use index to ensure key uniqueness even if day.day is duplicated
          <div key={`${day.day}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {/* --- END FIX --- */}
            <h3 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              {/* Check if day.day exists before rendering */}
              Day {day.day !== undefined ? day.day : index + 1}: {day.title}
            </h3>
            {day.date && (
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{day.date}</p>
            )}

            <div className="mt-3 space-y-3">
              {day.activities && Array.isArray(day.activities) && day.activities.map((activity, activityIndex) => ( // Use activityIndex
                // Key for inner loop remains the same, combining day and index
                <div key={`${day.day}-${activityIndex}`} className="pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                  <strong className="text-gray-900 dark:text-gray-100">{activity.time}:</strong>
                  <p className="text-gray-700 dark:text-gray-300">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}