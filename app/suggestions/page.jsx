// /app/suggestions/page.jsx
import dbConnect from '@/lib/dbConnect';
import Suggestion from '@/models/Suggestion';
import SuggestionCard from '../components/SuggestionCard';
import { Compass } from 'lucide-react';

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
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Compass className="h-10 w-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Trip Inspiration
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover amazing destinations and start planning your next adventure
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No suggestions found. Please add some to the database!
          </p>
        </div>
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