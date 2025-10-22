// /app/suggestions/page.jsx
import dbConnect from '@/lib/dbConnect';
import Suggestion from '@/models/Suggestion';
import SuggestionCard from '../components/SuggestionCard';

// This function runs on the server to get the data
async function getSuggestions() {
  await dbConnect();
  const suggestions = await Suggestion.find({});
  // We must serialize the data for the client component
  return JSON.parse(JSON.stringify(suggestions));
}

export default async function SuggestionsPage() {
  const suggestions = await getSuggestions();

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
        Trip Inspiration
      </h1>
      {suggestions.length === 0 ? (
        <p className="text-center text-gray-600">
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