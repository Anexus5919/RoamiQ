// /app/providers.jsx
'use client';

import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
// --- 1. Import the ItineraryProvider ---
import { ItineraryProvider } from './context/ItineraryContext';

export function Providers({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* --- 2. Wrap the content with ItineraryProvider --- */}
      <ItineraryProvider>
        <AnimatePresence>
          {isLoading && <Preloader />}
        </AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </ItineraryProvider>
      {/* --- End ItineraryProvider wrap --- */}
    </ThemeProvider>
  );
}