// /app/components/SuggestionCard.jsx
import Image from 'next/image';
import Link from 'next/link';

export default function SuggestionCard({ suggestion }) {
  const { destination, imageUrl, highlights, bestTimeToVisit } = suggestion;

  return (
    <Link
      href={{
        pathname: '/',
        query: { destination: destination }
      }}
      // --- THIS IS THE FIX ---
      // Apply shadow-lg by default (light mode)
      // In dark mode, use shadow-sm (smaller) and a very light, almost transparent gray shadow color.
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-md dark:shadow-gray-700/30 overflow-hidden transition-transform duration-300 hover:scale-105 block"
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={`View of ${destination}`}
          layout="fill"
          objectFit="cover"
          unoptimized={true}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{destination}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <strong>Best time to visit:</strong> {bestTimeToVisit}
        </p>
        <div className="mt-2">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Highlights:</h4>
          <ul className="list-disc list-inside pl-2 mt-1 space-y-0.5">
            {highlights.map((highlight, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{highlight}</li>
            ))}
          </ul>
        </div>
        <div className="text-center mt-4">
          <span className="inline-block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            View Plan
          </span>
        </div>
      </div>
    </Link>
  );
}