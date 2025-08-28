// Error Handler Utility
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
};

export default errorHandler;
  