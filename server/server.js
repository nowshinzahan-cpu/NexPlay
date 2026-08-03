const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');
const { initializeEmailService } = require('./services/emailService');
const { initializeTMDB } = require('./services/tmdbService');
const { initializeSportsAPI } = require('./services/sportsApiService');
const { initializeSportsCron } = require('./cron/sportsSync');
const { initializeMatchReminders } = require('./cron/matchReminders');
const { initializeSocket } = require('./socket');
const logger = require('./utils/logger');
const config = require('./config/env');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.clientUrl || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — skip in test mode
if (config.nodeEnv !== 'test') {
  app.use('/api', apiLimiter);
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use(routes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NexPlay API Server',
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'NOT_FOUND'
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize email service
    await initializeEmailService();

    // Initialize TMDB API service
    initializeTMDB();

    // Initialize Sports API service
    initializeSportsAPI();

    // Initialize sports sync cron job (FR-64/FR-68)
    initializeSportsCron();

    // Initialize match reminder cron (Sprint 3)
    initializeMatchReminders();

    const server = app.listen(config.port, () => {
      // Initialize Socket.io for real-time features
      initializeSocket(server);
      logger.info(`NexPlay API server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });
      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start the server automatically when not in test mode
// In test mode, supertest handles the app lifecycle
if (config.nodeEnv !== 'test') {
  startServer();
}

module.exports = app;
