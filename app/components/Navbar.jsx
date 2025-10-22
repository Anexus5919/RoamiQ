// /app/components/Navbar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeSwitcher from './ThemeSwitcher';
// 1. Import the context hook
import { useItinerary } from '../context/ItineraryContext';

export default function Navbar() {
  const pathname = usePathname();
  // 2. Get the setItinerary function from context
  const { setItinerary, setStreamingText, setError, setCotSteps } = useItinerary();

  const links = [
    { href: '/', label: 'Itinerary Builder' },
    { href: '/suggestions', label: 'Suggested Trips' },
  ];

  // 3. Create a function to clear the state
  const handleLogoClick = () => {
    // Only clear if we are already on the homepage,
    // otherwise the navigation itself handles the state reset.
    // For simplicity, we can just always clear it.
    setItinerary(null);
    setStreamingText('');
    setError(null);
    setCotSteps([]); // Clear CoT steps too
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg dark:shadow-gray-900/50 sticky top-0 z-40 rounded-b-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 4. Add onClick handler to the Link */}
          <Link href="/" onClick={handleLogoClick} className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">✈️ RoamIQ</span>
          </Link>

          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="hidden sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}