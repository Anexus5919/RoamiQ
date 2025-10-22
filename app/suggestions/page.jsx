// /app/suggestions/page.jsx
import dbConnect from '@/lib/dbConnect';
import Suggestion from '@/models/Suggestion';
import SuggestionCard from '../components/SuggestionCard';

// Fetch data on the server
async function getSuggestions() {
  await dbConnect();
  const suggestions = await Suggestion.find({});
  // Serialize data for the client component (SuggestionCard uses Link, needs serialization)
  return JSON.parse(JSON.stringify(suggestions));
}

export default async function SuggestionsPage() {
  const suggestions = await getSuggestions();

  return (
    <div>
      {/* --- THIS IS THE FIX --- */}
      {/* Added dark:text-indigo-400 for dark mode visibility */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-700 dark:text-indigo-400 mb-8">
        Trip Inspiration
      </h1>
      {/* ----------------------- */}

      {suggestions.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No suggestions found. Please add some to the database!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion._id} suggestion={suggestion} />
          ))}
        </div>
      )}
    </div>
  );
}

// Ensure dynamic fetching if deploying
export const dynamic = 'force-dynamic';