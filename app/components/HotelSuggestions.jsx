// /app/components/HotelSuggestions.jsx
import Image from 'next/image';

// Star rating component (no changes)
const StarRating = ({ rating }) => {
  if (!rating) return null;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = Math.max(0, 5 - fullStars - halfStar);
  
  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      ))}
      {halfStar > 0 && ( <span key="half" className="text-yellow-400">★</span> )}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating})</span>
    </div>
  );
};

export default function HotelSuggestions({ hotels }) {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-3xl font-bold text-indigo-700">
          Hotel Suggestions
        </h2>
        <p className="text-gray-600">No specific hotel suggestions found.</p>
      </div>
    );
  }

  return (
    <div className="sticky top-24 bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-3xl font-bold text-indigo-700">
        Hotel Suggestions
      </h2>
      <div className="space-y-4">
        {hotels.map((hotel, index) => {
          
          // --- THIS IS THE FIX ---
          // 1. Create a fallback URL that is a Google Search.
          const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(hotel.name + " " + (hotel.address || ''))}`;
          
          // 2. Use the 'hotel.link' if it exists, otherwise use the fallback.
          const finalUrl = hotel.link || fallbackSearchUrl;
          // -----------------------

          return (
            <a 
              href={finalUrl} // <-- Use the guaranteed 'finalUrl'
              target="_blank" 
              rel="noopener noreferrer"
              key={index} 
              className="flex items-center border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={hotel.photo || '/placeholder-image.jpg'} 
                  alt={hotel.name}
                  layout="fill"
                  objectFit="cover"
                  unoptimized={true}
                />
              </div>
              <div className="p-3 overflow-hidden">
                <h3 className="font-semibold text-gray-800 truncate" title={hotel.name}>{hotel.name}</h3>
                {hotel.rating && <StarRating rating={hotel.rating} />}
                <p className="text-sm text-gray-600 mt-1 truncate" title={hotel.address}>{hotel.address}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}