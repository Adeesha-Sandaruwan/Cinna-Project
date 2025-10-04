import React from 'react';

const LoadingSpinner = ({ size = 'normal', light = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    normal: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const colorClasses = light
    ? 'border-white/20 border-t-white'
    : 'border-amber-200 border-t-amber-600';

  return (
    <div className={`inline-block animate-spin rounded-full border-4 ${colorClasses} ${sizeClasses[size]}`} 
         role="status" 
         aria-label="loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;