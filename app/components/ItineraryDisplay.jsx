// /app/components/ItineraryDisplay.jsx

export default function ItineraryDisplay({ itinerary }) {
  if (!itinerary) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 text-center">Your Trip to {itinerary.destination}</h2>

      {/* Chain of Thought Bonus */}
      <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
        <h4 className="font-semibold text-blue-800">🤖 AI Planner's Thoughts:</h4>
        <p className="italic text-blue-700 text-sm mt-1">{itinerary.thoughtProcess}</p>
      </div>

      {/* Day-by-Day Itinerary */}
      <div className="space-y-4">
        {itinerary.days.map((day) => (
          <div key={day.day} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-blue-600">
              Day {day.day}: {day.title}
            </h3>
            <ul className="mt-2 space-y-2 pl-4 list-disc list-outside">
              {day.activities.map((activity, index) => (
                <li key={index} className="text-gray-700">
                  <strong className="text-gray-900">{activity.time}:</strong> {activity.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}