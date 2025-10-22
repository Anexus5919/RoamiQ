// /app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar'; // Import the Navbar

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Travel Guide',
  description: 'Your personal AI-powered tour planner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar /> {/* Add the Navbar here */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}