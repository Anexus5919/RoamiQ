// /app/components/Preloader.jsx
'use client';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export default function Preloader() {
  return (
    <motion.div
      key="preloader"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      >
        <Plane className="h-12 w-12 text-primary" />
        <span className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
          RoamIQ
        </span>
      </motion.div>
    </motion.div>
  );
}