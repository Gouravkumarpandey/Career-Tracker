const env = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  // Handle Prisma unique constraint or not found errors
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Unique constraint failed. Duplicate field value entered.';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found.';
    }
  }

  const response = {
    success: false,
    statusCode,
    message: message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  };

  console.error('❌ Error Middleware Caught:', err);

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
