const app = require('./src/app');
const env = require('./src/config/env');
const prisma = require('./src/config/prisma');

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully via Prisma.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();