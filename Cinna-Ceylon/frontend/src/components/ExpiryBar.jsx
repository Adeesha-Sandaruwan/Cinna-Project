import React, { useMemo } from 'react';

/**
 * ExpiryBar Component
 * Displays a visual bar representing how close a product is to expiry.
 *
 * Props:
 *  - createdAt: ISO date string (when product was created)
 *  - expiryDate: ISO date string (when product expires)
 *  - compact: boolean (show a smaller variant for grid cards)
 */
const ExpiryBar = ({ createdAt, expiryDate, compact = false }) => {
  const { percent, daysLeft, totalDays, status, color } = useMemo(() => {
    const now = new Date();
    const created = new Date(createdAt);
    const expiry = new Date(expiryDate);

    if (isNaN(expiry.getTime()) || isNaN(created.getTime())) {
      return { percent: 0, daysLeft: 0, totalDays: 0, status: 'Invalid', color: 'bg-gray-400' };
    }

    const total = Math.max(1, Math.ceil((expiry - created) / (1000 * 60 * 60 * 24))); // total shelf days
    const used = Math.min(total, Math.max(0, Math.ceil((now - created) / (1000 * 60 * 60 * 24))));
    const pct = Math.min(100, Math.max(0, Math.round((used / total) * 100)));
    const left = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));

    let stat = 'Fresh';
    let clr = 'bg-green-500';
    if (left <= 0) { stat = 'Expired'; clr = 'bg-red-600'; }
    else if (pct >= 75) { stat = 'Near Expiry'; clr = 'bg-orange-500'; }
    else if (pct >= 50) { stat = 'Mid Life'; clr = 'bg-yellow-500'; }

    return { percent: pct, daysLeft: left, totalDays: total, status: stat, color: clr };
  }, [createdAt, expiryDate]);

  return (
    <div className={`w-full ${compact ? '' : 'mt-3'}`}>      
      <div className={`h-2 w-full rounded bg-gray-200 overflow-hidden ${compact ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className={`h-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className={`flex justify-between mt-1 text-[10px] ${compact ? 'text-[10px]' : 'text-xs'} font-medium text-gray-600`}>
        <span>{status}</span>
        <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</span>
      </div>
    </div>
  );
};

export default ExpiryBar;
