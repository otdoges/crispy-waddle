"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fade in animation component
export const FadeIn = ({ 
  children, 
  duration = 0.5, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  duration?: number; 
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay }}
  >
    {children}
  </motion.div>
);

// Slide in animation component
export const SlideIn = ({ 
  children, 
  direction = 'left', 
  duration = 0.5, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  direction?: 'left' | 'right' | 'up' | 'down'; 
  duration?: number; 
  delay?: number;
}) => {
  const directionMap = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: -20 },
    down: { x: 0, y: 20 },
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x, y }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};

// Staggered list animation
export const StaggeredList = ({ 
  children, 
  staggerDelay = 0.1
}: { 
  children: React.ReactNode; 
  staggerDelay?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Scale animation component
export const ScaleIn = ({ 
  children, 
  duration = 0.5, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  duration?: number; 
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration, delay }}
  >
    {children}
  </motion.div>
);

// Pulse animation (for notifications, alerts, etc.)
export const Pulse = ({ 
  children 
}: { 
  children: React.ReactNode;
}) => (
  <motion.div
    animate={{ 
      scale: [1, 1.05, 1],
    }}
    transition={{ 
      duration: 1.5, 
      repeat: Infinity,
      repeatType: "reverse"
    }}
  >
    {children}
  </motion.div>
);

// Notification toast with animation
export const AnimatedToast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: { 
  message: string; 
  type?: 'info' | 'success' | 'error' | 'warning'; 
  duration?: number; 
  onClose?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 text-white shadow-lg ${typeStyles[type]}`}
          initial={{ opacity: 0, y: 50, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Page transition wrapper
export const PageTransition = ({ 
  children 
}: { 
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

// Secure message animation (encryption visual)
export const SecureMessageAnimation = ({ 
  children, 
  isEncrypted = true 
}: { 
  children: React.ReactNode; 
  isEncrypted?: boolean;
}) => {
  return (
    <motion.div
      initial={{ filter: "blur(8px)" }}
      animate={{ filter: isEncrypted ? "blur(8px)" : "blur(0px)" }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {children}
      {isEncrypted && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

// Loading animation with dots
export const LoadingDots = ({ 
  color = "text-emerald-500"
}: { 
  color?: string 
}) => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((dot) => (
      <motion.div
        key={dot}
        className={`h-2 w-2 rounded-full ${color}`}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: dot * 0.2,
        }}
      />
    ))}
  </div>
);

// Encryption animation for files and messages
export const EncryptionAnimation = () => {
  return (
    <div className="relative h-10 w-40">
      <motion.div
        className="absolute top-0 left-0 h-full w-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="h-full w-full bg-gradient-to-r from-emerald-500/20 via-emerald-500/60 to-emerald-500/20" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs font-medium text-emerald-500">Encrypting</span>
        </div>
      </div>
    </div>
  );
};

// Message typing indicator animation
export const TypingIndicator = () => (
  <div className="flex h-6 items-center space-x-1 rounded-full bg-zinc-700 px-3">
    <LoadingDots color="text-zinc-300" />
    <span className="text-xs text-zinc-300">typing...</span>
  </div>
); 