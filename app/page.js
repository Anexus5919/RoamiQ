// /app/page.js
'use client';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import ItineraryForm from './components/ItineraryForm';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { useItinerary } from './context/ItineraryContext';

// Main component - Landing page with form only
function LandingPage() {
  const router = useRouter();
  const { setFormData } = useItinerary();

  const handleFormSubmit = async (data) => {
    // Store form data in context
    setFormData(data);
    // Navigate to itinerary page
    router.push('/itinerary');
  };

  // The JSX structure - Landing page only
  return (
    <div className="fixed inset-0 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 overflow-hidden">
      {/* Full Screen Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="min-w-full min-h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ width: '100vw', height: '100vh' }}
        >
          <source src="https://videos.pexels.com/video-files/3094026/3094026-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
      
      {/* Content Container */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-6 text-white">
            <div className="space-y-5">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] drop-shadow-2xl">
                Wander More.
                <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                  Worry Less.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-xl drop-shadow-lg">
                Every adventure starts with a single click.
              </p>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
                Discover extraordinary destinations crafted just for you. Let our AI-powered travel planner transform your dreams into unforgettable adventures.
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  className="text-base px-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  onClick={() => window.location.href = '/suggestions'}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  I'm Feeling Lucky
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <div className="shadow-2xl backdrop-blur-sm bg-background/95 rounded-lg p-6">
            <ItineraryForm onSubmit={handleFormSubmit} isLoading={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export wraps the main component in Suspense
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <LandingPage />
    </Suspense>
  );
}