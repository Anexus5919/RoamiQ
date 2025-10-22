// /app/components/ItineraryDisplay.jsx

export default function ItineraryDisplay({ itinerary }) {
  if (!itinerary) return null;

  const { destinationName, destinationSummary, thoughtProcess, days } = itinerary;

  return (
    // Card Background: Slightly lighter gray in dark mode
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      
      {/* Title: Keep accent color vibrant */}
      <h2 className="text-4xl font-bold text-center text-indigo-700 dark:text-indigo-400">
        Your Trip to {destinationName}
      </h2>

      {/* Trip Overview Section */}
      {destinationSummary && (
        // Section Background: Use a different shade for contrast
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          {/* Section Title: Keep accent color */}
          <h4 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">Trip Overview</h4>
          {/* Section Text: Use lighter gray for dark mode */}
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>
              <strong className="text-gray-900 dark:text-gray-100">Best Time to Visit:</strong> 
              <span className="ml-1">{destinationSummary.bestTimeToVisit}</span>
            </p>
          </div>
        </div>
      )}

      {/* AI Thoughts Section */}
      {thoughtProcess && (
        // Background: Keep the blue hue, adjust darkness
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-600 rounded-r-lg">
          {/* Title: Adjust blue for dark mode */}
          <h4 className="font-semibold text-blue-800 dark:text-blue-300">🤖 AI Planner's Thoughts:</h4>
          {/* Text: Adjust blue for dark mode */}
          <p className="italic text-blue-700 dark:text-blue-400 text-sm mt-1">{thoughtProcess}</p>
        </div>
      )}

      {/* Day-by-Day Section */}
      <div className="space-y-4">
        {days && days.map((day) => (
          // Day Card Border: Lighter gray in dark mode
          <div key={day.day} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            
            {/* Day Title: Keep accent color */}
            <h3 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              Day {day.day}: {day.title}
            </h3>
            {/* Date Text: Lighter gray, slightly dimmer */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{day.date}</p>
            
            <div className="mt-3 space-y-3">
              {day.activities.map((activity, index) => (
                // Activity Border: Keep accent blue, adjust shade
                <div key={index} className="pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                  {/* Time Text: Brighter gray */}
                  <strong className="text-gray-900 dark:text-gray-100">{activity.time}:</strong>
                  {/* Description Text: Lighter gray */}
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