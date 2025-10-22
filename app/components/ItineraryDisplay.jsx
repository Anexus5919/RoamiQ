// /app/components/ItineraryDisplay.jsx

export default function ItineraryDisplay({ itinerary }) {
  if (!itinerary) return null;

  const { destinationName, destinationSummary, thoughtProcess, days } = itinerary;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-4xl font-bold text-center text-indigo-700">
        Your Trip to {destinationName}
      </h2>

      {destinationSummary && (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
          <h4 className="text-xl font-semibold text-indigo-700">Trip Overview</h4>
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <p>
              <strong className="text-gray-900">Best Time to Visit:</strong> 
              {/* --- THIS IS THE FIX --- */}
              <span className="ml-1">{destinationSummary.bestTimeToVisit}</span>
            </p>
          </div>
        </div>
      )}

      {thoughtProcess && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <h4 className="font-semibold text-blue-800">🤖 AI Planner's Thoughts:</h4>
          <p className="italic text-blue-700 text-sm mt-1">{thoughtProcess}</p>
        </div>
      )}

      <div className="space-y-4">
        {days && days.map((day) => (
          <div key={day.day} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-2xl font-semibold text-indigo-600">
              Day {day.day}: {day.title}
            </h3>
            {day.date && (
              <p className="text-sm font-medium text-gray-500 mb-2">{day.date}</p>
            )}
            
            <div className="mt-3 space-y-3">
              {day.activities.map((activity, index) => (
                <div key={index} className="pl-4 border-l-2 border-blue-200">
                  <strong className="text-gray-900">{activity.time}:</strong>
                  <p className="text-gray-700">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}