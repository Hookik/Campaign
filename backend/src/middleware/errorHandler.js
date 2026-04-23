/**
 * Global Error Handler Middleware
 */

function errorHandler(err, req, res, next) {
  // Only log stack in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${err.message}`, err.stack);
  } else {
    console.error(`[ERROR] ${err.message}`);
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details || undefined,
    });
  }

  // MySQL errors — generic messages, no schema leaks
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'This record already exists.',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided.',
    });
  }

  // Default 500 — never leak internals
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}

module.exports = { errorHandler };
