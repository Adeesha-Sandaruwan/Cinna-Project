// Simple manual test script for expiry calculation logic similar to ExpiryBar
// Run with: node src/utils/expiryCalc.test.js (after transpilation if needed or via Babel if configured)

function calc(createdAt, expiryDate, now = new Date()) {
  const created = new Date(createdAt);
  const expiry = new Date(expiryDate);
  const total = Math.max(1, Math.ceil((expiry - created) / 86400000));
  const used = Math.min(total, Math.max(0, Math.ceil((now - created) / 86400000)));
  const pct = Math.min(100, Math.max(0, Math.round((used / total) * 100)));
  const left = Math.max(0, Math.ceil((expiry - now) / 86400000));
  return { total, used, pct, left };
}

const today = new Date();
const created = new Date(today.getTime() - 5 * 86400000); // 5 days ago
const expiry = new Date(today.getTime() + 15 * 86400000); // in 15 days
console.log('Sample calc:', calc(created, expiry, today));

// Edge: expired
const expired = new Date(today.getTime() - 1 * 86400000);
console.log('Expired calc:', calc(created, expired, today));
