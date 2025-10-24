// /app/components/SuggestionCard.jsx
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function SuggestionCard({ suggestion }) {
  const { destination, imageUrl, highlights, bestTimeToVisit } = suggestion;

  return (
    <Link
      href={{
        pathname: '/',
        query: { destination: destination }
      }}
      className="block group"
    >
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={`View of ${destination}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{destination}</h3>
          </div>
        </div>
        
        <CardContent className="flex-1 p-4 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium">Best time to visit</span>
            </div>
            <p className="text-sm pl-5 leading-relaxed">{bestTimeToVisit}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Highlights</h4>
            </div>
            <ul className="space-y-1 pl-6">
              {highlights.map((highlight, index) => (
                <li key={index} className="text-sm text-muted-foreground list-disc">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}