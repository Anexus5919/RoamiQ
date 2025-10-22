// /app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
// 1. Import the new Providers
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RoamIQ', // 2. Updated title
  description: 'Your personal AI-powered tour planner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>
        <Providers> {/* <--- Providers wraps everything */}
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers> {/* <--- End Providers wrap */}
      </body>
    </html>
  );
}