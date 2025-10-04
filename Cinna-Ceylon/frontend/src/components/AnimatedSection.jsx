import React, { useEffect } from 'react';
// Framer Motion for animations
import { motion, useAnimation } from 'framer-motion';
// Hook to detect when an element is visible in the viewport
import { useInView } from 'react-intersection-observer';

const AnimatedSection = ({ children, className = '' }) => {
  // Controls for starting and stopping animations
  const controls = useAnimation();

  // "ref" attaches to the element, "inView" tells if it's visible on screen
  const [ref, inView] = useInView({ 
    threshold: 0.12,    // Trigger when 12% of the element is visible
    triggerOnce: true   // Run only once (no repeat animation on scroll back)
  });

  // Whenever "inView" becomes true, start the animation
  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <motion.section
      ref={ref}             // Attach intersection observer to this section
      initial="hidden"      // Initial animation state
      animate={controls}    // Controlled animation (changes when inView updates)
      variants={{
        visible: { opacity: 1, y: 0 },    // Final state: fully visible, normal position
        hidden: { opacity: 0, y: 30 },    // Start state: invisible & moved down slightly
      }}
      transition={{ 
        duration: 0.7,       // Animation speed (seconds)
        ease: 'easeOut'      // Smooth easing effect
      }}
      className={className}  // Allow passing custom Tailwind/other classes
    >
      {children}             {/* Render whatever is inside this section */}
    </motion.section>
  );
};

export default AnimatedSection;
