import React, { useState, useEffect, useRef } from 'react';

export default function Carousel({ images = [], interval = 4500 }) {
  // Current index of the active image
  const [index, setIndex] = useState(0);

  // Stores the timeout ID (so we can clear it later)
  const timeoutRef = useRef(null);

  // Tracks whether carousel is paused (true when mouse is hovering)
  const isPaused = useRef(false);

  // Autoplay effect
  useEffect(() => {
    if (isPaused.current) return; // If paused, don’t rotate

    // Set a timer to switch to next image after "interval"
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length); 
      // % ensures we loop back to 0 after last image
    }, interval);

    // Cleanup: clear timeout before next run (avoid stacking timers)
    return () => clearTimeout(timeoutRef.current);
  }, [index, images.length, interval]);

  // Jump to specific image
  function goTo(i) {
    setIndex(i % images.length);
  }

  // Go forward
  function next() {
    setIndex((prev) => (prev + 1) % images.length);
  }

  // Go backward
  function prev() {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => (isPaused.current = true)}   // Pause on hover
      onMouseLeave={() => {
        isPaused.current = false; 
        setIndex((i) => i); // Kick effect to restart autoplay
      }}
      aria-roledescription="carousel" // Accessibility role
    >
      {/* Render images stacked on top of each other */}
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt}
          className={`absolute inset-0 w-full h-full object-cover 
                      transition-opacity duration-700 
                      ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
      ))}

      {/* Controls (arrows, dots) could be added here */}
    </div>
  );
}
