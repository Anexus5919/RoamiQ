// /app/components/ChainOfThoughtDisplay.jsx
'use client';

import { CheckCircle, Loader2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

const StatusIcon = ({ status }) => {
  if (status === 'loading') {
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  }
  if (status === 'done') {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  return <Circle className="h-5 w-5 text-muted-foreground" />;
};

export default function ChainOfThoughtDisplay({ steps, rawJson }) {
  const completedSteps = steps.filter(s => s.status === 'done').length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Generating Your Itinerary...
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start space-x-3">
              <StatusIcon status={step.status} />
              <span className={cn(
                "text-sm font-medium",
                step.status === 'pending' && "text-muted-foreground",
                step.status !== 'pending' && "text-foreground"
              )}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        <details className="pt-4 border-t">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            View Raw AI Stream (for debugging)
          </summary>
          <div className="mt-2 bg-muted/50 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
            {rawJson || "Waiting for stream..."}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}