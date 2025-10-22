// /app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Travel Guide',
  description: 'Your personal AI-powered tour planner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* --- FIX: Force a white background to solve color issues --- */}
      <body className={`${inter.className} bg-white`}> 
        <Navbar />
        {/* --- FIX: Added padding for the new wider layout --- */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}