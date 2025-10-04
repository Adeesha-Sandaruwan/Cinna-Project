class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details for debugging
  console.error('ERROR 💥', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    status: err.status
  });

  if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: errors
    });
  }

  if (err.code === 11000) {
    // Handle duplicate key errors
    return res.status(400).json({
      status: 'fail',
      message: 'Duplicate field value entered'
    });
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'fail',
      message: 'File too large'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      status: 'fail',
      message: 'Unexpected field'
    });
  }

  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production mode - don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export { AppError, handleError, catchAsync };
