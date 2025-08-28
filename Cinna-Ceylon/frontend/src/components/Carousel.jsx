import React, { useState, useEffect, useRef } from 'react';

export default function Carousel({ images = [], interval = 4500 }) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    if (isPaused.current) return;
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearTimeout(timeoutRef.current);
  }, [index, images.length, interval]);

  function goTo(i) {
    setIndex(i % images.length);
  }
  function next() {
    setIndex((prev) => (prev + 1) % images.length);
  }
  function prev() {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => (isPaused.current = true)}
      onMouseLeave={() => {
        isPaused.current = false;
        setIndex((i) => i); // kick the effect to restart timer
      }}
      aria-roledescription="carousel"
    >
      {/* images (stacked, fade in/out) */}
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
      ))}
      {/* Carousel controls (arrows, dots) can be added here if needed */}
    </div>
  );
}
