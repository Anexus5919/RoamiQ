// /app/components/Preloader.jsx
'use client';
import { motion } from 'framer-motion';

export default function Preloader() {
  return (
    <motion.div
      // This 'key' is crucial for AnimatePresence
      key="preloader"
      // This makes it a full-screen overlay
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
      // This is the fade-out animation
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        // This animates the logo itself (a simple pulse)
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      >
        <span className="text-4xl font-extrabold text-indigo-700">
          ✈️ RoamIQ
        </span>
      </motion.div>
    </motion.div>
  );
}