// src/layout/PageWrapper.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="page"
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -30 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`min-h-screen ${className}`}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
};

export default PageWrapper;
