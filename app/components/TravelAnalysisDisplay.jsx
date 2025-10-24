// /app/components/TravelAnalysisDisplay.jsx
import { MapPin, Route, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export default function TravelAnalysisDisplay({ analysis }) {
  if (!analysis) return null;

  return (
    <Card className="shadow-lg border-l-4 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Travel Logistics
        </CardTitle>
        {analysis.summary && (
          <CardDescription className="italic">
            {analysis.summary}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.distance && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Distance:</span>
            <Badge variant="secondary">{analysis.distance}</Badge>
          </div>
        )}

        {analysis.options && analysis.options.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Transport Options:
              </h4>
              <div className="space-y-2 pl-6">
                {analysis.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <div className="flex-1">
                      <span className="font-medium">{option.mode}:</span>{' '}
                      <span className="text-muted-foreground">{option.time}</span>
                      {option.distance && (
                        <span className="text-muted-foreground text-sm"> ({option.distance})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}