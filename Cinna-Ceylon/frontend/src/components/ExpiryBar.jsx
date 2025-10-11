import React, { useMemo } from 'react';

/**
 * ExpiryBar Component
 * -------------------
 * Displays a progress bar showing how much of a product's shelf life has passed.
 * 
 * Props:
 *  - createdAt:   ISO date string → the date the product was added or manufactured
 *  - expiryDate:  ISO date string → the date when the product expires
 *  - compact:     boolean → if true, renders a smaller variant (used in grid cards)
 */
const ExpiryBar = ({ createdAt, expiryDate, compact = false }) => {

  // useMemo ensures the expiry calculations only run when inputs change
  const { percent, daysLeft, totalDays, status, color } = useMemo(() => {
    const now = new Date();
    const created = new Date(createdAt);
    const expiry = new Date(expiryDate);

    // Handle invalid or missing dates gracefully
    if (isNaN(expiry.getTime()) || isNaN(created.getTime())) {
      return {
        percent: 0,
        daysLeft: 0,
        totalDays: 0,
        status: 'Invalid',
        color: 'bg-gray-400'
      };
    }

    // Calculate total shelf life in days
    const total = Math.max(1, Math.ceil((expiry - created) / (1000 * 60 * 60 * 24)));

    // Calculate how many days have passed since creation
    const used = Math.min(total, Math.max(0, Math.ceil((now - created) / (1000 * 60 * 60 * 24))));

    // Determine the percentage of the product’s life used
    const pct = Math.min(100, Math.max(0, Math.round((used / total) * 100)));

    // Calculate how many days remain until expiry
    const left = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));

    // Determine the current expiry status and color
    let stat = 'Fresh';
    let clr = 'bg-green-500';
    if (left <= 0) {
      stat = 'Expired';
      clr = 'bg-red-600';
    } else if (pct >= 75) {
      stat = 'Near Expiry';
      clr = 'bg-orange-500';
    } else if (pct >= 50) {
      stat = 'Mid Life';
      clr = 'bg-yellow-500';
    }

    // Return computed values to be used in rendering
    return { percent: pct, daysLeft: left, totalDays: total, status: stat, color: clr };
  }, [createdAt, expiryDate]);

  return (
    <div className={`w-full ${compact ? '' : 'mt-3'}`}>
      {/* Progress bar background */}
      <div
        className={`h-2 w-full rounded bg-gray-200 overflow-hidden ${compact ? 'h-1.5' : 'h-2.5'}`}
      >
        {/* Filled portion of the progress bar */}
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      {/* Status text and remaining days */}
      <div
        className={`flex justify-between mt-1 font-medium text-gray-600 ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}
      >
        <span>{status}</span>
        <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</span>
      </div>
    </div>
  );
};

export default ExpiryBar;
