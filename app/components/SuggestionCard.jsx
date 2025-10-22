// /app/components/SuggestionCard.jsx

// We need to tell Next.js to allow images from this domain
// Add this to your `next.config.mjs`

import Image from 'next/image';

export default function SuggestionCard({ suggestion }) {
  const { destination, imageUrl, highlights, bestTimeToVisit } = suggestion;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={`View of ${destination}`}
          layout="fill"
          objectFit="cover"
          unoptimized={true} // Use this if your images are external and not configured
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900">{destination}</h3>
        <p className="text-sm text-gray-500 mt-1">
          <strong>Best time to visit:</strong> {bestTimeToVisit}
        </p>
        <div className="mt-2">
          <h4 className="font-semibold text-gray-700">Highlights:</h4>
          <ul className="list-disc list-inside pl-2 mt-1 space-y-0.5">
            {highlights.map((highlight, index) => (
              <li key={index} className="text-sm text-gray-600">{highlight}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}