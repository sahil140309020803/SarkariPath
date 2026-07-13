import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const variants = {
  'fade-up': {
    hidden: { opacity: 0, y: 50 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: custom.duration || 0.85,
        delay: custom.delay || 0.15,
        ease: [0.16, 1, 0.3, 1], // Custom premium ease-out cubic
      }
    })
  },
  'fade-down': {
    hidden: { opacity: 0, y: -50 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: custom.duration || 0.85,
        delay: custom.delay || 0.3,
        ease: [0.16, 1, 0.3, 1],
      }
    })
  },
  'fade-left': {
    hidden: { opacity: 0, x: 50 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: custom.duration || 0.85,
        delay: custom.delay || 0.3,
        ease: [0.16, 1, 0.3, 1],
      }
    })
  },
  'fade-right': {
    hidden: { opacity: 0, x: -50 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: custom.duration || 0.85,
        delay: custom.delay || 0.3,
        ease: [0.16, 1, 0.3, 1],
      }
    })
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: (custom) => ({
      opacity: 1,
      transition: {
        duration: custom.duration || 0.85,
        delay: custom.delay || 0.3,
        ease: 'easeOut',
      }
    })
  },
  'stagger-container': {
    hidden: {},
    visible: (custom) => ({
      transition: {
        staggerChildren: custom.staggerDelay || 0.15,
        delayChildren: custom.delay || 0.3,
      }
    })
  },
  'stagger-item': {
    hidden: { opacity: 0, y: 35 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: custom.duration || 0.85,
        ease: [0.16, 1, 0.3, 1],
      }
    })
  }
};

const AnimatedSection = ({
  children,
  type = 'fade-up',
  duration,
  delay,
  staggerDelay,
  className = '',
  id,
  style
}) => {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, bypass animations
  if (shouldReduceMotion) {
    return (
      <div id={id} className={className} style={style}>
        {children}
      </div>
    );
  }

  const activeVariant = variants[type] || variants['fade-up'];

  return (
    <motion.div
      id={id}
      style={style}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={activeVariant}
      custom={{ duration, delay, staggerDelay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
